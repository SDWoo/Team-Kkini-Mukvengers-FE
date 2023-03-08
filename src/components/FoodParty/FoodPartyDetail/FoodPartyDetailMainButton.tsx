import { Button } from '@chakra-ui/react';
import { FoodPartyStatus } from 'types/foodParty';

type FoodPartyDetailMainButtonProps = {
  isLeader: boolean;
  isMember: boolean;
  isFull: boolean;
  status: FoodPartyStatus;
};

const FoodPartyDetailMainButton = ({
  isLeader,
  isMember,
  isFull,
  status,
}: FoodPartyDetailMainButtonProps) => {
  const buttonText = getText(isLeader, isMember, isFull, status);
  const isDisabled = checkButtonTextIsDisabled(buttonText);

  return <>{buttonText !== '' && <Button disabled={isDisabled}>{buttonText}</Button>}</>;
};

export default FoodPartyDetailMainButton;

const LeaderText = {
  '모집 중': '출발할 끼니?',
  '모집 완료': '식사를 완료했끼니?',
  '식사 완료': '리뷰 작성하러 갈끼니?',
};

const MemberText = {
  '모집 중': '',
  '모집 완료': '',
  '식사 완료': '리뷰 작성하러 갈끼니?',
};

const NotMemberText = {
  '모집 중': '참여할 끼니?',
  '모집 완료': '모집이 완료되버렸끼니!',
  '식사 완료': '',
};

const getText = (
  isLeader: boolean,
  isMember: boolean,
  isFull: boolean,
  status: FoodPartyStatus
) => {
  // 방장인 경우
  if (isLeader) return LeaderText[status];

  // 멤버인 경우
  if (isMember) return MemberText[status];

  // 참여하지 않은 경우
  if (isFull) return '인원이 꽉 차버렸끼니!';
  return NotMemberText[status];
};

const checkButtonTextIsDisabled = (buttonText: string) => {
  return (
    buttonText === '인원이 꽉 차버렸끼니!' || buttonText === '모집이 완료되버렸끼니!'
  );
};
