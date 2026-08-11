export type ProjectStep = {
  id: string;
  title: string;
  description: string;
  href: string | null; // null = not implemented yet
};

export type Project = {
  id: string;
  title: string;
  description: string;
  steps: ProjectStep[];
  active: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "ecommerce-setup",
    title: "자사몰 세팅",
    description: "자사몰 오픈을 위한 콘텐츠/운영 준비 업무",
    active: true,
    steps: [
      {
        id: "blog",
        title: "블로그 콘텐츠 제작",
        description: "화자(전문가형/후기형/지식인형)와 주제를 입력하면 AI가 블로그 초안을 작성합니다. 최소 4개 이상 작성 후 검수합니다.",
        href: "/projects/ecommerce-setup/blog",
      },
      {
        id: "product-listing",
        title: "상품 등록 (준비중)",
        description: "상품 정보/이미지/가격 등록 업무",
        href: null,
      },
      {
        id: "payment-shipping",
        title: "결제/배송 설정 (준비중)",
        description: "결제 수단, 배송 정책 설정",
        href: null,
      },
    ],
  },
];

export function getProject(projectId: string): Project | undefined {
  return PROJECTS.find((p) => p.id === projectId);
}
