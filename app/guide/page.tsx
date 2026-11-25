import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h2 className="text-lg font-semibold text-[#193653]">이용방법</h2>
      <div className="mt-4 space-y-4 rounded-lg border border-[#d5deea] bg-white p-5 text-sm leading-6">
        <section>
          <h3 className="font-semibold text-[#193653]">1. 학교(기관)명 입력</h3>
          <p>
            학교(기관)명을 한 줄에 하나씩 입력하거나 엑셀에서 복사해 붙여넣습니다.
          </p>
          <p>정식 명칭과 약칭을 모두 입력 가능합니다.</p>
          <p>
          (예: 각화초등학교, 각화초 | 광주계림초등학교, 계림초)
          </p>
        </section>
        <section>
          <h3 className="font-semibold text-[#193653]">2. 조회 버튼 클릭</h3>
          <p><b>(정상 입력인 경우)</b> 학교 코드 및 관련 정보가 자동으로 입력됩니다.</p>
          <p><b>(※ 잘못 입력한 경우)</b> 비고란에 '데이터 없음' 문구가 표기됩니다. </p>
          <p>→ 학교 이름을 수정한 뒤 칸 밖을 누르면 다시 조회됩니다.</p>
          <p><b>(※ 중복 학교명인 경우)</b> 비고란에 '중복된 학교 이름입니다. 지역을 앞에 붙여주세요.' 문구가 표기됩니다.</p>
          <p>→ 같은 이름이 여러 기관이면 지역과 기관명을 고릅니다. 지역을 붙여 다시 입력해도 됩니다.</p>
          <p>(예: 동강초등학교 → 고흥동강초등학교 / 나주동강초등학교 |  대성초등학교 → 광주대성초등학교 / 목포대성초등학교)</p>
        </section>
        <section>
          <h3 className="font-semibold text-[#193653]">3. 등록 파일 만들기</h3>
          <p>수신그룹명을 입력하고 등록 파일 만들기 버튼 클릭 시, 에듀파인 수신처 일괄등록용 엑셀 파일이 자동으로 생성됩니다.</p>
          </section>
        <section>
          <h3 className="font-semibold text-[#193653]">4. 에듀파인 등록</h3>
          <p>
            받은 파일을 에듀파인 개인수신그룹 엑셀 업로드 화면에서 등록합니다. 등록 화면의 자세한
            순서는 <Link href="/registration" className="text-[#193653] underline">에듀파인 등록방법</Link>에서 확인해주세요.
          </p>
        </section>
        <p className="border-t border-[#e6edf4] pt-3 text-[#526277]">
          문의: 담당자(글로컬미래교육과 김유선 ☎061-260-0309)
        </p>
      </div>
    </main>
  );
}
