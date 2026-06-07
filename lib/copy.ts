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
    noImage: "이미지 없음",
    imageListLabel: "상품 이미지 목록",
    imageAlt: (title: string, index = 1) =>
      index === 1 ? `${title} 이미지` : `${title} 이미지 ${index}`,
    imageCount: (count: number) => `이미지 ${count}장`,
    rank: (rank: number) => `${rank}위`
  },
  eventPhases: {
    intake: "상품 접수 중",
    event: "이벤트 진행 중",
    selection: "상품 선택 중"
  },
  eventStatus: {
    intakeTitle: "상품 접수 중입니다",
    intakeDeadline: (date: string) => `${date}까지 접수중`,
    intakeNoDeadline: "상품을 접수하고 있습니다",
    eventTitle: "이벤트 진행중입니다",
    eventRemaining: (days: number, hours: number) =>
      `이벤트 종료까지 ${days}일 ${hours}시간`,
    eventEnded: "상품을 선택해주세요",
    eventNoEnd: "이벤트가 진행 중입니다",
    selectionTitle: (rank: number) => `${rank}등 상품 선택 차례입니다`,
    selectionDetail: "당첨자는 코드를 입력해 상품을 선택해 주세요",
    selectionDoneTitle: "상품을 선택해주세요",
    selectionDoneDetail: "모든 선택 차례가 완료되었습니다"
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
    adminPassword: "관리자 비밀번호",
    eventPhase: "현재 단계",
    itemSubmissionDeadline: "상품 접수 마감일",
    eventEndAt: "이벤트 종료일"
  },
  home: {
    eyebrow: "제2회 아카라이브 기타채널 바자회",
    title: "2026 기타 채널 바자회",
    lead:
      "상품 등록 후 운영자가 승인한 물품만 공개 상품 목록에 표시됩니다.\n당첨자는 운영자가 발급한 코드를 입력하여 순서대로 상품을 선택할 수 있습니다.",
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
    closedTitle: "상품 접수가 닫혔습니다",
    closedLead: "현재는 상품을 새로 등록할 수 없는 단계입니다.",
    submit: "등록하기",
    submitting: "등록 중",
    imageHelp: "이미지는 최대 10개, 파일당 25MB까지 업로드할 수 있습니다. iPhone HEIC 사진은 자동으로 변환됩니다.",
    selectedImages: (count: number) => `${count}개의 이미지를 선택했습니다.`,
    heicPreviewNote: "HEIC 변환 예정",
    errors: {
      closed: "현재는 상품을 등록할 수 없습니다.",
      type: "JPG, PNG, WebP, GIF, HEIC 이미지만 업로드할 수 있습니다.",
      size: "이미지는 25MB 이하만 업로드할 수 있습니다.",
      count: "상품 하나당 이미지는 최대 10개까지 업로드할 수 있습니다.",
      "total-size": "이미지는 한 번에 총 120MB 이하로 업로드해 주세요.",
      upload: "이미지를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
    }
  },
  winnerEntry: {
    eyebrow: "Winner",
    title: "당첨자 코드 입력",
    lead: "운영자가 발급한 코드를 입력하면 상품 선택 페이지로 이동합니다.",
    codePlaceholder: "예: R1-A1B2C3D4",
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
    waitingForRank: (rank: number) =>
      `${rank}위 당첨자가 먼저 상품을 선택해야 합니다.`,
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
    eventSettings: "이벤트 단계 설정",
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
    searchItems: "상품 검색",
    searchItemsPlaceholder: "상품명, 상태, 연락처 검색",
    searchWinners: "당첨자 검색",
    searchWinnersPlaceholder: "이름, 코드, 선택 상품 검색",
    filterStatus: "상태 필터",
    noMatchingItems: "조건에 맞는 상품이 없습니다.",
    noMatchingWinners: "조건에 맞는 당첨자가 없습니다.",
    createWinner: "당첨자 등록",
    updateWinner: "당첨자 수정",
    saveSettings: "설정 저장",
    autoWinnerCode: "순위를 입력하면 당첨자 코드가 자동 발급됩니다.",
    saveSelectionPermission: "선택 권한 저장",
    deleteWinner: "당첨자 삭제",
    saving: "저장 중",
    winnerCodeLine: (rank: number, code: string) => `${rank}위 · 코드 ${code}`,
    winnerCodeOnly: (code: string) => `발급 코드: ${code}`,
    confirmDeleteWinner: (name: string) =>
      name ? `${name} 당첨자를 삭제할까요?` : "이 당첨자를 삭제할까요?",
    noSelectedItem: "선택 상품 없음",
    selectionWaiting: "선택 대기",
    rankWaiting: "순번 대기",
    messages: {
      itemSaved: "상품 정보를 저장했습니다.",
      statusSaved: "상태를 저장했습니다.",
      statusError: "상태를 저장하지 못했습니다.",
      imageSaved: "이미지를 교체했습니다.",
      imageError: "이미지를 교체하지 못했습니다.",
      winnerCreated: "당첨자를 등록했습니다.",
      winnerUpdated: "당첨자를 수정했습니다.",
      winnerPermissionSaved: "선택 권한을 저장했습니다.",
      winnerDeleted: "당첨자를 삭제했습니다.",
      winnerDeleteError: "당첨자를 삭제하지 못했습니다.",
      settingsSaved: "이벤트 설정을 저장했습니다.",
      settingsError: "이벤트 설정을 저장하지 못했습니다."
    },
    errors: {
      "image-empty": "교체할 이미지를 선택해 주세요.",
      "image-size": "이미지는 25MB 이하만 업로드할 수 있습니다.",
      "image-count": "상품 하나당 이미지는 최대 10개까지 업로드할 수 있습니다.",
      "image-total-size": "이미지는 한 번에 총 120MB 이하로 업로드해 주세요.",
      "image-type": "JPG, PNG, WebP, GIF, HEIC 이미지만 업로드할 수 있습니다.",
      "image-upload": "이미지를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      "item-update": "상품 정보를 수정하지 못했습니다.",
      "winner-code": "이미 사용 중인 당첨자 코드입니다."
    }
  }
};
