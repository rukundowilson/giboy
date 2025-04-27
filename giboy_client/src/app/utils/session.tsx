
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; 
  iat: number;
}

export function isUserLoggedIn(): boolean {
  const token = localStorage?.getItem('token');
  const userData = localStorage?.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : { email: '' };  
  if (!token && !userData){
    return false; 
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token!);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('token');
    return false;
  }
}
