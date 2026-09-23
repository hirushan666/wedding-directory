import { defineField, defineType } from "sanity";

export const vendorCallout = defineType({
  name: "vendorCallout",
  title: "Vendor / Service Spotlight",
  type: "object",
  fields: [
    defineField({
      name: "vendorName",
      title: "Vendor Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Service Category",
      type: "string",
      placeholder: "e.g., Luxury Venue, Wedding Photographer",
    }),
    defineField({
      name: "description",
      title: "Short Recommendation / Highlight",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "linkUrl",
      title: "Directory Link URL",
      type: "string",
      placeholder: "e.g., /services/65a123bc... or /services",
    }),
    defineField({
      name: "rating",
      title: "Rating (optional)",
      type: "number",
      validation: (rule) => rule.min(1).max(5),
    }),
  ],
  preview: {
    select: {
      title: "vendorName",
      subtitle: "category",
    },
  },
});
