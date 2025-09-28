import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values"
import { paginationOptsValidator } from "convex/server";
export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, {ids}) => {
    const documents = [];
    for (const id of ids) {
      const document = await ctx.db.get(id);

      if(document) {
        documents.push({id: document._id, title: document.title});
      }
      else{
        documents.push({id, name: "[Removed]"});
      }
    }
    return documents;
  }
})
export const create = mutation({
  args: { 
    title: v.optional(v.string()), 
    initialContent: v.optional(v.string()),
    // Allow forcing personal document creation
    forcePersonal: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    console.log("📝 === CREATING DOCUMENT ===");
    console.log("📝 User subject:", user.subject);
    console.log("📝 User organization_id:", user.organization_id);
    console.log("📝 Args:", args);

    // If forcePersonal is true, always create as personal document
    const organizationId = args.forcePersonal 
      ? undefined 
      : (user.organization_id ?? undefined) as | string | undefined;

    console.log("📝 Final organizationId:", organizationId);
    console.log("📝 Document type:", organizationId ? "ORGANIZATION" : "PERSONAL");

    const docId = await ctx.db.insert("documents", {
      title: args.title ?? "Untitled Document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    });

    console.log("📝 Document created with ID:", docId);
    console.log("📝 === DOCUMENT CREATION COMPLETED ===");

    return docId;
  }
});

export const get = query({
  args: { 
    paginationOpts: paginationOptsValidator, 
    search: v.optional(v.string()),
    // Add explicit parameter to request personal docs
    showPersonal: v.optional(v.boolean())
  },
  handler: async (ctx, { search, paginationOpts, showPersonal }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as | string | undefined;

    // Force personal view when showPersonal is true
    const requestPersonal = showPersonal || false;

    // Search logic
    if (search) {
      if (requestPersonal) {
        // Search personal documents only
        return await ctx.db
          .query("documents")
          .withSearchIndex("search_title", (q) =>
            q.search("title", search).eq("ownerId", user.subject)
          )
          .filter((q) => q.eq(q.field("organizationId"), undefined))
          .paginate(paginationOpts);
      } else if (organizationId) {
        // Search within organization
        return await ctx.db
          .query("documents")
          .withSearchIndex("search_title", (q) =>
            q.search("title", search).eq("organizationId", organizationId)
          )
          .paginate(paginationOpts);
      } else {
        // Default personal search when not in org
        return await ctx.db
          .query("documents")
          .withSearchIndex("search_title", (q) =>
            q.search("title", search).eq("ownerId", user.subject)
          )
          .filter((q) => q.eq(q.field("organizationId"), undefined))
          .paginate(paginationOpts);
      }
    }

    // Non-search logic
    if (requestPersonal) {
      // Always show personal documents when explicitly requested
      return await ctx.db
        .query("documents")
        .withIndex("by_owner_id_organization_id", (q) => 
          q.eq("ownerId", user.subject).eq("organizationId", undefined)
        )
        .paginate(paginationOpts);
    } else if (organizationId) {
      // Show organization documents
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
        .paginate(paginationOpts);
    } else {
      // Default: show personal documents when not in organization
      return await ctx.db
        .query("documents")
        .withIndex("by_owner_id_organization_id", (q) => 
          q.eq("ownerId", user.subject).eq("organizationId", undefined)
        )
        .paginate(paginationOpts);
    }
  },
});

export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const document = await ctx.db.get(args.id);
    const organizationId = (user.organization_id ?? undefined) as | string | undefined;

    if (!document) {
      throw new ConvexError("Document not found");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(document.organizationId && document.organizationId === organizationId);

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

export const updateById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as | string | undefined;
    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("Document not found");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(document.organizationId && document.organizationId === organizationId);

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, {id}) => {
    const document =  await ctx.db.get(id);
    if (!document) {
      throw new ConvexError("Document not found");
    }
    return document;
  },
});