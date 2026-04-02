interface ListBlockProps {
  items: string[];
  ordered?: boolean;
}

export function ListBlock({ items, ordered = false }: ListBlockProps) {
  if (ordered) {
    return (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
} 