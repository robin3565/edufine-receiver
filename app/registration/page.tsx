import Image from "next/image";

const STEPS = [
  {
    src: "/registration/step-1.png",
    width: 2170,
    height: 571,
    alt: "1) 개인설정 아이콘 클릭, 2) 개인수신그룹관리 클릭",
  },
  {
    src: "/registration/step-2.png",
    width: 2170,
    height: 569,
    alt: "3) 일괄등록 버튼 클릭",
  },
  {
    src: "/registration/step-3.png",
    width: 1708,
    height: 433,
    alt: "4) 찾아보기 버튼 클릭 후 엑셀 파일 업로드, 5) 저장 버튼 클릭",
  },
  {
    src: "/registration/step-4.png",
    width: 2295,
    height: 698,
    alt: "6) 반영 버튼을 선택하여 수신그룹 반영. 반영여부를 반영으로 설정해야 수신그룹으로 사용 가능",
  },
];

export default function RegistrationPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h2 className="text-lg font-semibold text-[#193653]">에듀파인 등록방법</h2>
      <div className="mt-4 space-y-4 rounded-lg border border-[#d5deea] bg-white p-5">
        <p className="text-sm font-semibold text-[#193653]">
          ★ 에듀파인 [개인수신그룹] 엑셀 파일 업로드 방법
        </p>
        {STEPS.map((step) => (
          <Image
            key={step.src}
            src={step.src}
            width={step.width}
            height={step.height}
            alt={step.alt}
            className="h-auto w-full rounded border border-[#d5deea]"
          />
        ))}
      </div>
    </main>
  );
}
