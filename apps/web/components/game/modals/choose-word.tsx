import { Modal } from "../../ui/Modal";

interface ChooseWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const words = ["Ping", "Pong", "Ting"];
export default function ChooseWordModal({
  onClose,
  isOpen,
}: ChooseWordModalProps) {
  const handleClick = (word: string) => {
    console.log(word);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className="flex justify-evenly items-center gap-6 max-md:flex-col">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => handleClick(word)}
            className="px-4 py-2 rounded-xl bg-green-700 text-white cursor-pointer hover:bg-green-600 duration-200"
          >
            {word}
          </button>
        ))}
      </section>
    </Modal>
  );
}
