// 인증 페이지 공통 레이아웃
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 40%, #1a4a6b 70%, #0f2942 100%)',
      }}
    >
      {/* 배경 장식 원형들 */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}
      />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
      />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 60%)', transform: 'translate(-50%, -50%)' }}
      />

      {/* 도시 실루엣 (SVG) */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" className="w-full">
          <rect x="0"   y="120" width="60"  height="80" fill="white"/>
          <rect x="10"  y="80"  width="40"  height="40" fill="white"/>
          <rect x="20"  y="60"  width="20"  height="20" fill="white"/>
          <rect x="70"  y="100" width="50"  height="100" fill="white"/>
          <rect x="80"  y="70"  width="30"  height="30" fill="white"/>
          <rect x="130" y="60"  width="70"  height="140" fill="white"/>
          <rect x="145" y="30"  width="10"  height="30" fill="white"/>
          <rect x="210" y="90"  width="55"  height="110" fill="white"/>
          <rect x="275" y="110" width="45"  height="90"  fill="white"/>
          <rect x="330" y="50"  width="80"  height="150" fill="white"/>
          <rect x="350" y="20"  width="10"  height="30"  fill="white"/>
          <rect x="420" y="80"  width="60"  height="120" fill="white"/>
          <rect x="490" y="100" width="50"  height="100" fill="white"/>
          <rect x="550" y="40"  width="90"  height="160" fill="white"/>
          <rect x="570" y="10"  width="12"  height="30"  fill="white"/>
          <rect x="650" y="90"  width="55"  height="110" fill="white"/>
          <rect x="715" y="110" width="45"  height="90"  fill="white"/>
          <rect x="760" y="70"  width="40"  height="130" fill="white"/>
        </svg>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
