import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
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
            <h1 className="text-xl font-semibold">개인정보처리방침</h1>
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div className="container-narrow py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="prose max-w-none">
            
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">1. 수집하는 개인정보 항목</h2>
              <p className="mb-2 text-gray-600">서비스는 다음과 같은 개인정보를 수집할 수 있습니다.</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>필수:</strong> 이메일 주소, 로그인 계정 정보(구글, 카카오 등), UID(식별자)</li>
                <li><strong>선택:</strong> 프로필 이미지, 닉네임, 푸시 알림 토큰</li>
                <li><strong>서비스 이용 과정에서 자동 수집:</strong> 접속 IP, 브라우저 정보, 접속 로그, 기기 정보, 쿠키</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">2. 개인정보 수집 및 이용 목적</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>회원 식별 및 계정 관리</li>
                <li>서비스 제공 및 맞춤형 기능 제공</li>
                <li>서비스 개선 및 오류 해결</li>
                <li>공지사항 및 알림 발송(선택 시)</li>
                <li>법령상 의무 이행</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">3. 개인정보 보유 및 이용기간</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>회원 탈퇴 시 즉시 파기</li>
                <li>다만, 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관 후 파기<br/>
                  (예: 전자상거래 등에서의 소비자 보호에 관한 법률 등)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-600">
                서비스는 이용자의 개인정보를 사전 동의 없이 제3자에게 제공하지 않습니다.<br/>
                단, 법령에 따라 요구되는 경우 예외로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">5. 개인정보 처리의 위탁</h2>
              <p className="mb-2 text-gray-600">서비스는 Firebase(Google LLC)를 통해 데이터 저장 및 서버 운영을 위탁하고 있습니다.</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>위탁 항목:</strong> 서비스 이용 데이터, 계정 정보</li>
                <li><strong>위탁 목적:</strong> 데이터 저장, 서비스 운영</li>
                <li><strong>위탁 위치:</strong> 한국</li>
                <li><strong>Google LLC의 개인정보 보호정책:</strong> 
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                    https://policies.google.com/privacy
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">6. 국외 이전에 관한 사항</h2>
              <p className="text-gray-600">
                Firebase 서버 위치에 따라 개인정보가 국외로 이전될 수 있습니다. 이용자는 이 점에 동의해야 서비스를 이용할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">7. 개인정보의 파기 절차 및 방법</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>전자 파일:</strong> 복구 불가능한 방법으로 삭제</li>
                <li><strong>종이 문서:</strong> 파쇄 또는 소각</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">8. 이용자의 권리와 행사 방법</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>본인 확인 후 개인정보 열람·수정·삭제 요청 가능</li>
                <li>서비스 내 고객센터 또는 이메일을 통해 문의 가능</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">9. 쿠키(Cookie)의 사용</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>서비스는 로그인 상태 유지, 이용자 환경 설정을 위해 쿠키를 사용할 수 있습니다.</li>
                <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">10. 개인정보 보호책임자</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>이름:</strong> 김재민</li>
                <li><strong>이메일:</strong> 
                  <a href="mailto:peoplelivinglife@gmail.com" className="text-blue-500 hover:underline ml-1">
                    peoplelivinglife@gmail.com
                  </a>
                </li>
              </ul>
            </section>

            <hr className="my-6 border-gray-200" />
            
            <div className="text-sm text-gray-500">
              <strong>부칙</strong><br/>
              본 방침은 2025년 8월 14일부터 시행합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}