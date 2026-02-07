export default function Sidebar({ role }) {
  const advisorLinks = [
    "Overview",
    "Advisor Requests",
    "My Students",
    "Submissions",
    "Reviews",
    "Messages",
    "Calendar",
    "Reports",
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <ul className="space-y-3 text-gray-700">
        {advisorLinks.map((item) => (
          <li key={item} className="hover:text-[#1f67a8] cursor-pointer">
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}