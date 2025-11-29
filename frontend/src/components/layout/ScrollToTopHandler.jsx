import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopHandler = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Optional: adds smooth scrolling animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTopHandler;
