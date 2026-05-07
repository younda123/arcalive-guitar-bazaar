import type { DeliveryMethod, ItemStatus } from "./types";

export const statusLabels: Record<ItemStatus, string> = {
  pending: "승인 대기",
  approved: "선택 가능",
  selected: "선택 완료",
  completed: "전달 완료",
  hidden: "숨김",
  deleted: "삭제됨"
};

export const deliveryLabels: Record<DeliveryMethod, string> = {
  shipping: "배송",
  direct: "직거래",
  negotiable: "협의"
};

export function statusClass(status: ItemStatus) {
  return ["approved", "selected", "completed"].includes(status) ? status : "";
}
