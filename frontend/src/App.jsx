import 
function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
