import Navbar from "./Navbar";

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[68px]">{children}</div>
    </>
  );
}
