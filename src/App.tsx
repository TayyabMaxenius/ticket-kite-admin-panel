import React from "react";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./contexts/AuthContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "./pages/login/page";
import { ShowsPage } from "./pages/shows/page";
import { VenuesPage } from "./pages/venues/page";
import { ToursPage } from "./pages/tours/page";
import { AttractionsPage } from "./pages/attractions/page";
import { HotelsPage } from "./pages/hotels/page";
import type { SidebarItem } from "./components/sidebar";

function renderPage(active: SidebarItem) {
  switch (active) {
    case "Shows":
      return <ShowsPage />;
    case "Venues":
      return <VenuesPage />;
    case "Tours":
      return <ToursPage />;
    case "Attractions":
      return <AttractionsPage />;
    case "Hotels":
      return <HotelsPage />;
    default:
      return null;
  }
}

function AppContent() {
  const { currentUser } = useAuth();
  const [active, setActive] = React.useState<SidebarItem>("Shows");

  React.useEffect(() => {
    if (currentUser) {
      setActive("Shows");
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout activePage={active} onPageChange={setActive}>
      {renderPage(active)}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
