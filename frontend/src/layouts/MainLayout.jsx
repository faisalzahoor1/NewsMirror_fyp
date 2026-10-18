import {Navbar} from "../components/Navbar";
import {Footer} from "../components/Footer";
import {InboxModal} from "../components/InboxModal";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <InboxModal />
    </>
  );
};

export default MainLayout;