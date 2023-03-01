import useKakaoMapContext from 'contexts/kakaoMap';
import useRandomRestaurantContext from 'contexts/kakaoMap/randomRestaurant';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { kakaoMapOptionsState } from 'stores/kakaoMap';
import { kakaoMapHelpers } from 'utils/helpers/kakaoMap';

const DEFAULT_RADIUS = 300;
const DEFAULT_BADGE_IMAGE_SIZE = 72;
const KAKAO_RESTAURANT_CATEGORY_CODE = 'FD6';
const RESTAURANT_BADGE_IMAGE_FILE_PATH = '/images/restaurant-badge.svg';

const useRecommendRandomRestaurant = () => {
  const [recommendRandomRestaurantIsLoading, setRecommendRandomRestaurantIsLoading] =
    useState(false);
  const setKakaoMapOptions = useSetRecoilState(kakaoMapOptionsState);
  const { kakaoMap } = useKakaoMapContext();
  const { setRandomRestaurant, handleOpenRandomRestaurantModal } =
    useRandomRestaurantContext();

  /**
   * To Do: placeName 나오는 부분 스타일링 필요 by 승준
   */
  const makeRandomRestaurantOverlayContent = (placeName: string) => {
    const containerElement = document.createElement('div');
    containerElement.innerHTML = `<img
                                    class='random-restaurant-custom-overlay'
                                    src=${RESTAURANT_BADGE_IMAGE_FILE_PATH}
                                    style="
                                      width: ${DEFAULT_BADGE_IMAGE_SIZE}px;
                                      height: ${DEFAULT_BADGE_IMAGE_SIZE}px;
                                      z-index: 11;
                                      border-radius: 50%;
                                      box-shadow: 5px 5px 7px 5px rgba(0, 0, 0, 0.25);
                                    "
                                  />
                                  <div style='background-color: white; padding: 0.5rem;'>${placeName}</div>`;
    containerElement.onclick = () => {
      handleOpenRandomRestaurantModal();
    };

    return containerElement;
  };

  const recommendRandomRestaurant = () => {
    if (!kakaoMap) return;

    setRecommendRandomRestaurantIsLoading(true);
    const kakaoPlacesService = new kakao.maps.services.Places();

    const { latitude: currentLatitude, longitude: currentLongitude } =
      kakaoMapHelpers.getCenter(kakaoMap);
    const placesSearchOptions: kakao.maps.services.PlacesSearchOptions = {
      x: currentLongitude,
      y: currentLatitude,
      radius: DEFAULT_RADIUS,
    };

    const nearbyRestaurants: kakao.maps.services.PlacesSearchResultItem[] = [];
    kakaoPlacesService.categorySearch(
      KAKAO_RESTAURANT_CATEGORY_CODE,
      (resultByKakaoCategorySearch, status, pagination) => {
        // To Do: ZERO_RESULT, ERROR 각 상황 처리 필요 by. 승준
        const { OK, ZERO_RESULT, ERROR } = kakao.maps.services.Status;

        if (status === OK) {
          nearbyRestaurants.push(...resultByKakaoCategorySearch);
          pagination.hasNextPage && pagination.nextPage();
        }

        // 더 이상 맛집 데이터가 없을 때 랜덤으로 맛집을 추천하는 로직을 수행.
        // 최대 45개의 맛집 데이터를 얻을 수 있다.
        if (!pagination.hasNextPage) {
          // 랜덤 숫자 생성
          const randomIndex = Math.floor(Math.random() * nearbyRestaurants.length);

          // google api 시작
          const googlePlacesService = new google.maps.places.PlacesService(
            document.createElement('div')
          );

          // google textSearch
          googlePlacesService.textSearch(
            {
              query: nearbyRestaurants[randomIndex].road_address_name,
              type: 'restaurant',
            },
            (resultByGoogleTextSearch, status, pagination) => {
              // To Do: status 값에 따라 재시도 등 예외 처리 필요 by. 승준
              if (!resultByGoogleTextSearch || !resultByGoogleTextSearch[0].place_id)
                return;

              // google getDetails
              googlePlacesService.getDetails(
                {
                  placeId: resultByGoogleTextSearch[0].place_id,
                },
                (resultByGoogleGetDetails, status) => {
                  // To Do: status 값에 따라 재시도 등 예외 처리 필요 by. 승준
                  if (!resultByGoogleGetDetails) return;

                  // 데이터 정합성은 아무래도 한국이다보니 카카오맵이 더 나을 것 같아 최대한 카카오맵 데이터를 이용함.
                  const {
                    place_name: placeName,
                    category_name: categoryName,
                    road_address_name: roadAddressName,
                    place_url: kakaoPlaceUrl,
                    phone: phoneNumber,
                  } = nearbyRestaurants[randomIndex];
                  const { photos, opening_hours, rating } = resultByGoogleGetDetails;
                  const categories = categoryName
                    .split('>')
                    .map((category) => category.trim());
                  const photoUrls = photos?.map((photo) => photo.getUrl());
                  const isOpen = opening_hours?.isOpen();

                  // kakao custom overlay 생성
                  const createdCustomOverlay = new kakao.maps.CustomOverlay({
                    position: new kakao.maps.LatLng(
                      Number(nearbyRestaurants[randomIndex].y),
                      Number(nearbyRestaurants[randomIndex].x)
                    ),
                    clickable: true,
                    content: makeRandomRestaurantOverlayContent(placeName),
                  });

                  setRandomRestaurant({
                    placeName,
                    categories,
                    roadAddressName,
                    rating,
                    photoUrls,
                    isOpen,
                    kakaoPlaceUrl,
                    phoneNumber,
                    customOverlay: createdCustomOverlay,
                  });
                  setRecommendRandomRestaurantIsLoading(false);
                  setKakaoMapOptions((previousKakaoMapOptions) => ({
                    ...previousKakaoMapOptions,
                    center: {
                      lat: currentLatitude,
                      lng: currentLongitude,
                    },
                  }));
                }
              );
            }
          );
        }
      },
      placesSearchOptions
    );
  };

  return {
    recommendRandomRestaurant,
    recommendRandomRestaurantIsLoading,
  };
};

export default useRecommendRandomRestaurant;
