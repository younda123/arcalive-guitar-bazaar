import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { listPublicItems } from "@/lib/store";

export default async function Home() {
  const items = await listPublicItems();

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Arcalive Guitar Bazaar</p>
        <h1>후원 상품을 보여주고, 당첨자의 선택을 안전하게 기록합니다.</h1>
        <p className="lead">
          회원가입 없이 상품을 등록하고, 운영자가 승인한 상품만 공개하며,
          당첨자는 발급받은 코드로 하나의 상품을 선택합니다.
        </p>
        <div className="actions">
          <Link className="button primary" href="/items/new">
            상품 등록
          </Link>
          <Link className="button" href="/winner">
            당첨자 코드 입력
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>공개 상품</h2>
        {items.length > 0 ? (
          <div className="grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="empty">아직 공개된 상품이 없습니다.</p>
        )}
      </section>
    </main>
  );
}
