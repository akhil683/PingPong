import { Modal } from "../../ui/Modal";

interface ChooseWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const scores = [
  {
    name: "Akhil",
    points: 240,
  },
  {
    name: "Shivansh",
    points: 365,
  },
  {
    name: "Rishu Thakur",
    points: 240,
  },
  {
    name: "Dheeraj",
    points: 65,
  },
  {
    name: "Manasvin",
    points: 0,
  },
];

export default function RoundPointsModal({
  onClose,
  isOpen,
}: ChooseWordModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className="flex justify-center items-center flex-col text-gray-800 gap-3">
        <p className="text-3xl">
          The word was <span className="text-blue-700">Hello</span>
        </p>
        <p className="text-xl">The time is up</p>
        <div className="flex flex-col gap-1 text-lg w-[50%]">
          {scores.map((score) => (
            <div key={score.name} className="flex justify-between items-center">
              <span>{score.name}</span>
              <span
                className={
                  score.points === 0 ? "text-red-600" : "text-green-700"
                }
              >
                {score.points !== 0 && "+"}
                {score.points}
              </span>
            </div>
          ))}
        </div>
      </section>
    </Modal>
  );
}
