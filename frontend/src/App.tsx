import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";


export default function App() {
  return (
    // <Routes>
    //   <Route element={<Layout />}>
    //     <Route path="/" element={<Home />} />
    //     <Route path="/login" element={<Login />} />
    //   </Route>
    // </Routes>
    <Layout />
  );
}

