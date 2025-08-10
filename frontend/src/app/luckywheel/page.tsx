import LuckyWheel from "../components/LuckyWheel";

export default function LuckyWheelPage() {
  return (
    <div>
      <h2 style={{ textAlign: "center", margin: 24, color: "#e74c3c" }}>Vòng quay may mắn</h2>
      <LuckyWheel visible={false} onClose={function (): void {
        throw new Error("Function not implemented.");
      } } />
    </div>
  );
}