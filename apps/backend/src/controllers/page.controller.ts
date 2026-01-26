import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// 📄 GET ALL PAGES for a user role (Provider, Admin, User, etc.)
export const getPagesByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        error: "Missing role parameter. Use: /api/pages?role=PROVIDER",
      });
    }

    // Validate role
    if (!["PROVIDER", "ADMIN", "STAFF", "USER"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Allowed: PROVIDER, ADMIN, STAFF, USER",
      });
    }

    const pages = await prisma.page.findMany({
      where: {
        userRole: {
          hasSome: [role as Role],
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      role,
      count: pages.length,
      pages,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pages", details: error });
  }
};

// 📄 GET SINGLE PAGE by slug
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { role } = req.query;

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        error: "Missing role parameter. Use: /api/pages/slug?role=PROVIDER",
      });
    }

    const page = await prisma.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Check if user role has access
    if (!page.userRole.includes(role as Role)) {
      return res.status(403).json({
        error: "Access denied. You don't have permission to view this page.",
      });
    }

    res.json({
      success: true,
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        type: page.type,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch page", details: error });
  }
};

// 📄 CREATE or UPDATE PAGE (Admin only)
export const upsertPage = async (req: Request, res: Response) => {
  try {
    const { slug, title, content, type, userRole } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({
        error: "Missing required fields: slug, title, content",
      });
    }

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        title,
        content,
        type,
        userRole: userRole || ["PROVIDER", "USER"],
      },
      create: {
        slug,
        title,
        content,
        type,
        userRole: userRole || ["PROVIDER", "USER"],
      },
    });

    res.json({
      success: true,
      message: `Page "${slug}" saved successfully`,
      page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save page", details: error });
  }
};

// 📄 DELETE PAGE (Admin only)
export const deletePage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const page = await prisma.page.delete({
      where: { slug },
    });

    res.json({
      success: true,
      message: `Page "${slug}" deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete page", details: error });
  }
};
