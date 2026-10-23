import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page narrow center">
      <h1 className="page-title">This piece isn&apos;t on the rail.</h1>
      <Link href="/" className="btn-outline">
        Back to the shop
      </Link>
    </section>
  );
}
