import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPages() {
  console.log("🌱 Seeding pages...");

  // Sample pages for both roles
  const pages = [
    // User-facing pages
    {
      slug: "how-it-works",
      title: "How Queue Works",
      content: `Welcome to Queue Pro! Here's how to use the app:

1. Create an account or log in
2. Find a clinic near you
3. Join the queue
4. Wait for your turn
5. Consult with the doctor

You'll receive notifications when it's your turn!`,
      type: "GUIDE",
      userRole: ["USER"],
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      content: `Q: How do I join a queue?
A: Search for a clinic, tap on it, and click "Join Queue".

Q: Can I cancel my booking?
A: Yes, you can cancel before your turn is called.

Q: What if I miss my turn?
A: You'll be marked as missed. Contact the clinic to reschedule.`,
      type: "HELP",
      userRole: ["USER"],
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `Your privacy is important to us. Queue Pro collects minimal data:
- Name and phone number for appointments
- Location data for finding nearby clinics
- All data is encrypted and never shared with third parties.

For details, contact us at privacy@queuepro.com`,
      type: "PRIVACY",
      userRole: ["USER", "PROVIDER"],
    },
    {
      slug: "terms-of-service",
      title: "Terms of Service",
      content: `By using Queue Pro, you agree to:
1. Use the app for its intended purpose
2. Not abuse queue system
3. Comply with clinic policies
4. Accept our liability limitations

Full terms available on our website.`,
      type: "TERMS",
      userRole: ["USER", "PROVIDER"],
    },

    // Provider-facing pages
    {
      slug: "provider-guide",
      title: "Provider User Guide",
      content: `Welcome to Queue Pro Provider Portal!

Features:
- View patient queue in real-time
- Call next patient with one tap
- Track consultation time
- View clinic analytics
- Manage staff

For support, contact admin@queuepro.com`,
      type: "GUIDE",
      userRole: ["PROVIDER", "ADMIN"],
    },
    {
      slug: "queue-management",
      title: "Queue Management Guide",
      content: `Best practices for managing queues:

1. Call patients on time
2. Mark no-shows properly
3. Keep queue moving
4. Handle emergencies appropriately

Tips: Use the priority system for urgent cases.`,
      type: "GUIDE",
      userRole: ["PROVIDER", "ADMIN"],
    },
    {
      slug: "analytics-help",
      title: "Understanding Analytics",
      content: `Analytics help you understand:
- Average wait time
- Patient satisfaction
- Peak hours
- No-show rate

Use this data to optimize your clinic schedule.`,
      type: "HELP",
      userRole: ["PROVIDER", "ADMIN"],
    },
    {
      slug: "support",
      title: "Technical Support",
      content: `Having issues? Try these:

1. Force restart the app
2. Check your internet connection
3. Log out and log back in
4. Clear app cache

Still stuck? Email support@queuepro.com`,
      type: "HELP",
      userRole: ["PROVIDER", "ADMIN"],
    },
  ];

  for (const page of pages) {
    const existing = await prisma.page.findUnique({
      where: { slug: page.slug },
    });

    if (existing) {
      console.log(`✓ Page "${page.slug}" already exists. Skipping...`);
    } else {
      await prisma.page.create({
        data: {
          slug: page.slug,
          title: page.title,
          content: page.content,
          type: page.type as any,
          userRole: page.userRole as Role[],
        },
      });
      console.log(`✅ Created page: "${page.slug}"`);
    }
  }

  console.log("✨ Seeding complete!");
}

seedPages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
