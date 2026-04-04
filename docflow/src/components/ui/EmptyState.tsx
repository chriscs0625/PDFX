export function EmptyState({ title, desc, action }: { title: string, desc: string, action: React.ReactNode }) {
  return (
    <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      {action}
    </div>
  );
}