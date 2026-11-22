export default function Loading() {
  return (
    <div className="container-page py-16">
      <div className="skeleton h-3 w-24 rounded-[1px]" />
      <div className="skeleton mt-6 h-14 w-2/3 max-w-xl rounded-[2px]" />
      <div className="skeleton mt-4 h-4 w-1/2 max-w-md rounded-[1px]" />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="skeleton h-48 rounded-[2px]" />
        <div className="skeleton h-48 rounded-[2px]" />
        <div className="skeleton h-48 rounded-[2px]" />
      </div>
    </div>
  );
}
