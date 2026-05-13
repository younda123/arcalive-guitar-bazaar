export const copy = {
  app: {
    title: "기타 채널 바자회",
    description: "아카라이브 기타 채널 커뮤니티 바자회 운영 도구",
    navLabel: "주요 메뉴",
    nav: {
      items: "상품 목록",
      newItem: "상품 등록",
      winner: "당첨자"
    }
  },
  common: {
    noImage: "NO IMAGE",
    imageListLabel: "상품 이미지 목록",
    imageAlt: (title: string, index = 1) =>
      index === 1 ? `${title} 이미지` : `${title} 이미지 ${index}`,
    rank: (rank: number) => `${rank}위`
  },
  fields: {
    itemTitle: "상품명",
    itemDescription: "상품 설명",
    itemCondition: "상품 상태",
    itemImage: "상품 이미지",
    deliveryMethod: "전달 방식",
    donorContact: "후원자 연락처",
    winnerName: "당첨자명",
    winnerRank: "순위",
    winnerCode: "코드",
    adminPassword: "관리자 비밀번호"
  },
  home: {
    eyebrow: "Arcalive Guitar Bazaar",
    title: "2026 기타 채널 바자회",
    lead:
      "상품 등록 후 운영자가 승인한 물품만 공개 상품 목록에 표시됩니다. 당첨자 선정은 무작위 추첨으로 이루어지며, 당첨자는 운영자가 발급한 코드를 입력하여 상품을 선택할 수 있습니다.",
    publicItems: "공개 상품",
    empty: "아직 공개된 상품이 없습니다.",
    actions: {
      newItem: "상품 등록",
      winner: "당첨자 코드 입력"
    }
  },
  items: {
    eyebrow: "Items",
    title: "상품 목록",
    all: "전체",
    filterLabel: "상품 상태 필터",
    empty: "조건에 맞는 상품이 없습니다.",
    detail: "상세보기"
  },
  itemDetail: {
    eyebrow: "Item Detail",
    submitted:
      "상품이 등록되었습니다. 관리자 승인을 기다려주세요."
  },
  itemForm: {
    eyebrow: "Donation",
    title: "상품 등록",
    lead: "등록된 상품은 관리자 승인 전까지 공개 상품 목록에 표시되지 않습니다.",
    submit: "등록하기",
    errors: {
      type: "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
      size: "이미지는 10MB 이하만 업로드할 수 있습니다.",
      count: "상품 하나당 이미지는 최대 10개까지 업로드할 수 있습니다."
    }
  },
  winnerEntry: {
    eyebrow: "Winner",
    title: "당첨자 코드 입력",
    lead: "운영자가 발급한 코드를 입력하면 상품 선택 페이지로 이동합니다.",
    codePlaceholder: "예: DEMO-1",
    submit: "확인"
  },
  winner: {
    eyebrow: "Winner Page",
    invalidTitle: "유효하지 않은 코드입니다.",
    invalidLead: "코드를 다시 확인해 주세요.",
    selectedNotice: "상품 선택이 완료되었습니다.",
    selectError:
      "상품을 선택할 수 없습니다. 이미 선택했거나 선택 권한이 닫혔을 수 있습니다.",
    selectedItem: "선택한 상품",
    selectableItems: "선택 가능한 상품",
    selectionOpen: "선택 가능",
    selectionWaiting: "선택 대기",
    noPermission: "아직 선택 권한이 열리지 않았습니다.",
    empty: "현재 선택 가능한 상품이 없습니다.",
    selectThis: "이 상품 선택",
    donorContact: (contact: string) => `후원자 연락처: ${contact}`
  },
  admin: {
    eyebrow: "Admin",
    loginTitle: "관리자 로그인",
    loginLead: "비밀번호를 입력해주세요.",
    loginError: "비밀번호가 올바르지 않습니다.",
    login: "로그인",
    title: "관리자 페이지",
    logout: "로그아웃",
    itemManagement: "상품 관리",
    winnerCreate: "당첨자 등록",
    selectionResults: "선택 결과",
    updateItem: "상품 정보 수정",
    replaceImage: "이미지 교체",
    saveStatus: "상태 저장",
    approve: "승인",
    completeDelivery: "전달 완료",
    cancelSelection: "선택 취소",
    hide: "숨김",
    canSelect: "선택 가능",
    createWinner: "당첨자 등록",
    updateWinner: "당첨자 수정",
    saveSelectionPermission: "선택 권한 저장",
    deleteWinner: "당첨자 삭제",
    winnerCodeLine: (rank: number, code: string) => `${rank}위 · 코드 ${code}`,
    noSelectedItem: "선택 상품 없음",
    selectionWaiting: "선택 대기",
    errors: {
      "image-empty": "교체할 이미지를 선택해 주세요.",
      "image-size": "이미지는 10MB 이하만 업로드할 수 있습니다.",
      "image-count": "상품 하나당 이미지는 최대 10개까지 업로드할 수 있습니다.",
      "image-type": "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
      "item-update": "상품 정보를 수정하지 못했습니다.",
      "winner-code": "이미 사용 중인 당첨자 코드입니다."
    }
  }
};
