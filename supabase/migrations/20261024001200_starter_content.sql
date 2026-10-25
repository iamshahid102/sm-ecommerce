-- Phase 10: starter CMS content.
-- Safe to re-run. Existing pages, menu items, and sections are preserved.

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'about',
  'About SM Store',
  'Quality everyday products, selected with care and delivered across Pakistan.',
  $html$
  <h2>Built for everyday shopping</h2>
  <p>SM Store brings together thoughtful everyday products at transparent prices. We focus on reliable quality, clear product information, and a checkout experience that stays simple.</p>
  <h3>What we value</h3>
  <ul>
    <li>Products we would use ourselves.</li>
    <li>Honest pricing with no hidden charges.</li>
    <li>Careful packing and reliable nationwide delivery.</li>
    <li>Responsive support before and after your order.</li>
  </ul>
  <p>Cash on Delivery is available so you can inspect your parcel before paying. If you have a question, our contact page is the fastest way to reach us.</p>
  $html$,
  true,
  now(),
  'About SM Store',
  'Learn about SM Store, our approach to everyday products, and our nationwide delivery.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'about'
);

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'faq',
  'Frequently asked questions',
  'Answers about ordering, delivery, payments, cancellations, and reviews.',
  $html$
  <h2>Orders</h2>
  <h3>How do I place an order?</h3>
  <p>Add products to your cart, sign in, choose a delivery address, and confirm checkout. You will receive an order number immediately.</p>
  <h3>Can I change my order after placing it?</h3>
  <p>Contact us as soon as possible. Changes are easiest before the order moves to Processing. Once shipped, the courier process applies.</p>
  <h2>Delivery</h2>
  <h3>How long does delivery take?</h3>
  <p>Orders are usually dispatched within 1–2 working days. Delivery time depends on your city and courier coverage.</p>
  <h3>How can I track my order?</h3>
  <p>Open My Orders from your account. When the store adds a tracking number or courier, it appears on the order detail page.</p>
  <h2>Payments</h2>
  <h3>Which payment methods are available?</h3>
  <p>Cash on Delivery is currently available. Card payments remain disabled until a payment provider is connected.</p>
  <h2>Cancellations, returns, and reviews</h2>
  <h3>Can I cancel an order?</h3>
  <p>You can cancel while the order is Pending or Confirmed. After that, please contact support.</p>
  <h3>When can I leave a review?</h3>
  <p>Reviews unlock after an order is marked Delivered. Each customer can review a purchased product once.</p>
  $html$,
  true,
  now(),
  'Frequently asked questions',
  'Answers about placing orders, delivery, Cash on Delivery, cancellations, and product reviews.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'faq'
);

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'privacy-policy',
  'Privacy policy',
  'How SM Store collects, uses, and protects your personal information.',
  $html$
  <h2>Information we collect</h2>
  <p>We collect the details you provide when creating an account or ordering, including your name, email address, phone number, and delivery address. We also keep order records and basic technical logs needed to operate the store securely.</p>
  <h2>How we use information</h2>
  <ul>
    <li>To process orders and arrange delivery.</li>
    <li>To provide account, order, and review features.</li>
    <li>To respond to support enquiries.</li>
    <li>To protect the store against abuse and unauthorised access.</li>
  </ul>
  <h2>Payments</h2>
  <p>Cash on Delivery orders do not require card details. If card payments are added later, payment information will be handled by the payment provider rather than stored by this store.</p>
  <h2>Data retention and access</h2>
  <p>Order records are retained for accounting and support purposes. You can update your profile from your account. Contact us if you need help with your data.</p>
  <h2>Cookies and sessions</h2>
  <p>The store uses cookies and local storage for sign-in sessions, cart state, and essential preferences. We do not sell personal information.</p>
  $html$,
  true,
  now(),
  'Privacy policy',
  'How SM Store collects, uses, and protects customer information.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'privacy-policy'
);

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'terms',
  'Terms and conditions',
  'The rules that apply when you browse or order from SM Store.',
  $html$
  <h2>Using the store</h2>
  <p>By creating an account or placing an order, you agree to provide accurate information and use the store lawfully. Accounts may be limited or blocked where there is evidence of abuse, fraud, or repeated policy violations.</p>
  <h2>Product information</h2>
  <p>We aim to keep descriptions, images, pricing, and stock accurate. Minor differences in colour or packaging can occur. If an item is unavailable after an order is placed, we will contact you to resolve it.</p>
  <h2>Pricing and availability</h2>
  <p>Prices are shown in Pakistani Rupees and may change without notice. The price confirmed at checkout applies to that order. Shipping charges and any discount are shown before you confirm.</p>
  <h2>Orders and cancellation</h2>
  <p>Orders are subject to stock and review. Customers may cancel while an order is Pending or Confirmed. Later cancellations or returns are handled through support and the return policy.</p>
  <h2>Reviews and content</h2>
  <p>Reviews must be based on a genuine purchase and must not contain unlawful, abusive, or misleading content. We may hide reviews that breach these rules.</p>
  $html$,
  true,
  now(),
  'Terms and conditions',
  'Terms for using SM Store, placing orders, and submitting reviews.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'terms'
);

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'return-policy',
  'Return policy',
  'How to report a damaged, incorrect, or faulty item.',
  $html$
  <h2>Reporting a problem</h2>
  <p>Please inspect your parcel on delivery. If an item is damaged, faulty, or different from what you ordered, contact us within 48 hours with your order number and clear photographs.</p>
  <h2>Eligibility</h2>
  <ul>
    <li>The item should be unused and in its original packaging where possible.</li>
    <li>Personal-care, innerwear, and customised items may not be eligible for hygiene or customisation reasons.</li>
    <li>Proof of purchase or the order number is required.</li>
  </ul>
  <h2>Resolution</h2>
  <p>Depending on the issue, we may arrange a replacement, exchange, or refund. Return shipping arrangements are confirmed by support before you send anything back.</p>
  <h2>Non-returnable situations</h2>
  <p>Normal wear, misuse, incorrect care, or damage reported after the stated window may not qualify. This policy does not limit any rights provided by applicable law.</p>
  $html$,
  true,
  now(),
  'Return policy',
  'How to report damaged, incorrect, or faulty items and request a resolution.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'return-policy'
);

insert into public.cms_pages (
  slug, title, excerpt, content, is_published, published_at, meta_title, meta_description
)
select
  'shipping-policy',
  'Shipping policy',
  'Delivery charges, dispatch times, and nationwide coverage.',
  $html$
  <h2>Dispatch</h2>
  <p>Orders are usually packed and dispatched within 1–2 working days after confirmation. Orders placed on holidays may be processed on the next working day.</p>
  <h2>Delivery charges</h2>
  <p>The shipping fee is calculated at checkout based on the store settings in force at that time. Free shipping may apply above the store threshold shown in the cart or checkout summary.</p>
  <h2>Coverage and timelines</h2>
  <p>We deliver across Pakistan through courier partners. Timelines vary by city and courier network. Remote areas may require additional time.</p>
  <h2>Tracking</h2>
  <p>When a tracking number and courier are added to your order, they appear on the order detail page in your account.</p>
  <h2>Cash on Delivery</h2>
  <p>For COD orders, please keep the exact amount ready. If delivery attempts fail repeatedly, the order may be returned to the store.</p>
  $html$,
  true,
  now(),
  'Shipping policy',
  'Delivery charges, dispatch timelines, tracking, and nationwide coverage details.'
where not exists (
  select 1 from public.cms_pages where lower(slug) = 'shipping-policy'
);

do $$
begin
  if not exists (select 1 from public.menu_items) then
    insert into public.menu_items (location, label, url, sort_order) values
      ('header', 'Shop', '/products', 1),
      ('header', 'About', '/about', 2),
      ('header', 'Contact', '/contact', 3),
      ('footer', 'About', '/about', 1),
      ('footer', 'FAQ', '/faq', 2),
      ('footer', 'Privacy policy', '/privacy-policy', 3),
      ('footer', 'Terms', '/terms', 4),
      ('footer', 'Returns', '/return-policy', 5),
      ('footer', 'Shipping', '/shipping-policy', 6);
  end if;
end $$;

insert into public.home_sections (section_key, title, subtitle, config, sort_order, is_active)
select
  'featured_products',
  'Featured products',
  'A short edit of products worth a closer look.',
  '{"limit": 8}'::jsonb,
  1,
  true
where not exists (
  select 1 from public.home_sections where section_key = 'featured_products'
);

insert into public.home_sections (section_key, title, subtitle, config, sort_order, is_active)
select
  'new_arrivals',
  'New arrivals',
  'The latest additions to the store.',
  '{"limit": 8}'::jsonb,
  2,
  true
where not exists (
  select 1 from public.home_sections where section_key = 'new_arrivals'
);

insert into public.home_sections (section_key, title, subtitle, config, sort_order, is_active)
select
  'shop_by_category',
  'Shop by category',
  'Find what you need without the guesswork.',
  '{}'::jsonb,
  3,
  true
where not exists (
  select 1 from public.home_sections where section_key = 'shop_by_category'
);
