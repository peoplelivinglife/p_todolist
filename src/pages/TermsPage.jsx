import { useNavigate } from 'react-router-dom'

export default function TermsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container-narrow py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <h1 className="text-xl font-semibold">이용약관</h1>
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div className="container-narrow py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제1조 (목적)</h2>
              <p className="text-gray-600">
                이 약관은 ducklylist (이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제2조 (정의)</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>"서비스"란 이용자가 할 일, 일정 등을 등록·관리할 수 있도록 제공되는 웹/모바일 애플리케이션을 말합니다.</li>
                <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 서비스에 회원가입을 한 자를 말합니다.</li>
                <li>"콘텐츠"란 서비스 내에 이용자가 작성, 등록한 모든 데이터를 의미합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 고지함으로써 효력을 발생합니다.</li>
                <li>서비스 제공자는 필요 시 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다. 변경 시 변경 사유 및 내용을 사전 공지합니다.</li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제4조 (서비스의 제공 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>서비스는 다음과 같은 기능을 제공합니다.
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>일정·할 일 등록, 수정, 삭제</li>
                    <li>태그, 색상 등 분류 기능</li>
                    <li>캘린더 UI 제공</li>
                    <li>백로그(날짜 미지정) 관리</li>
                    <li>푸시 알림(선택 시)</li>
                  </ul>
                </li>
                <li>서비스 제공자는 기술적 필요에 따라 서비스 내용을 변경할 수 있으며, 중요한 변경 시 사전 공지합니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제5조 (서비스의 중단)</h2>
              <p className="text-gray-600">
                천재지변, 시스템 점검, 기타 불가피한 사유가 발생한 경우 서비스 제공을 일시 중단할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제6조 (회원가입 및 계정 관리)</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>회원가입은 이용자가 구글, 카카오, 이메일 등 인증 절차를 통해 신청하면 서비스 제공자가 이를 승낙함으로써 완료됩니다.</li>
                <li>회원은 계정 정보를 최신 상태로 유지해야 하며, 계정을 제3자에게 양도하거나 대여할 수 없습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제7조 (이용자의 의무)</h2>
              <p className="mb-2 text-gray-600">이용자는 다음 행위를 해서는 안 됩니다.</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>타인의 정보 도용</li>
                <li>서비스 내 허위 정보 등록</li>
                <li>서비스 운영 방해 행위</li>
                <li>법령 및 공공질서 위반 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제8조 (콘텐츠의 권리와 책임)</h2>
              <p className="text-gray-600">
                이용자가 서비스에 등록한 콘텐츠의 저작권은 이용자에게 있으며, 서비스 제공자는 운영·보안·백업 목적으로 필요한 범위 내에서 이를 저장·관리할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제9조 (이용계약 해지)</h2>
              <p className="text-gray-600">
                회원은 언제든지 서비스 내 '탈퇴' 기능을 통해 이용계약을 해지할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">제10조 (면책조항)</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>서비스 제공자는 천재지변, 이용자의 귀책사유로 인한 서비스 장애에 대하여 책임지지 않습니다.</li>
                <li>서비스 제공자는 이용자가 서비스 내에서 작성한 정보의 신뢰성, 정확성에 대해 보증하지 않습니다.</li>
              </ol>
            </section>

            <hr className="my-6 border-gray-200" />
            
            <div className="text-sm text-gray-500">
              <strong>부칙</strong><br/>
              본 약관은 2025년 8월 14일부터 시행합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}