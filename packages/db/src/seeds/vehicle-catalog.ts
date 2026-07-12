import { vehicleMakes, vehicleModels } from "../schema/vehicle";
import type { createDb } from "../index";

type Db = ReturnType<typeof createDb>;

const CATALOG = [
  {
    id: "make-toyota",
    name: "Toyota",
    models: [
      { id: "model-toyota-camry", name: "Camry", yearFrom: 2006, yearTo: 2026 },
      { id: "model-toyota-corolla", name: "Corolla", yearFrom: 2005, yearTo: 2026 },
      { id: "model-toyota-rav4", name: "RAV4", yearFrom: 2006, yearTo: 2026 },
      { id: "model-toyota-land-cruiser", name: "Land Cruiser Prado", yearFrom: 2003, yearTo: 2026 },
    ],
  },
  {
    id: "make-volkswagen",
    name: "Volkswagen",
    models: [
      { id: "model-vw-golf", name: "Golf", yearFrom: 2004, yearTo: 2026 },
      { id: "model-vw-passat", name: "Passat", yearFrom: 2005, yearTo: 2026 },
      { id: "model-vw-tiguan", name: "Tiguan", yearFrom: 2008, yearTo: 2026 },
      { id: "model-vw-polo", name: "Polo", yearFrom: 2002, yearTo: 2026 },
    ],
  },
  {
    id: "make-renault",
    name: "Renault",
    models: [
      { id: "model-renault-logan", name: "Logan", yearFrom: 2005, yearTo: 2026 },
      { id: "model-renault-duster", name: "Duster", yearFrom: 2010, yearTo: 2026 },
      { id: "model-renault-megane", name: "Megane", yearFrom: 2003, yearTo: 2026 },
    ],
  },
  {
    id: "make-skoda",
    name: "Skoda",
    models: [
      { id: "model-skoda-octavia", name: "Octavia", yearFrom: 2004, yearTo: 2026 },
      { id: "model-skoda-superb", name: "Superb", yearFrom: 2002, yearTo: 2026 },
      { id: "model-skoda-kodiaq", name: "Kodiaq", yearFrom: 2017, yearTo: 2026 },
    ],
  },
  {
    id: "make-hyundai",
    name: "Hyundai",
    models: [
      { id: "model-hyundai-tucson", name: "Tucson", yearFrom: 2005, yearTo: 2026 },
      { id: "model-hyundai-solaris", name: "Solaris", yearFrom: 2011, yearTo: 2026 },
      { id: "model-hyundai-creta", name: "Creta", yearFrom: 2016, yearTo: 2026 },
    ],
  },
  {
    id: "make-bmw",
    name: "BMW",
    models: [
      { id: "model-bmw-3-series", name: "3 Series", yearFrom: 2005, yearTo: 2026 },
      { id: "model-bmw-x5", name: "X5", yearFrom: 2007, yearTo: 2026 },
      { id: "model-bmw-5-series", name: "5 Series", yearFrom: 2004, yearTo: 2026 },
    ],
  },
  {
    id: "make-chevrolet",
    name: "Chevrolet",
    models: [
      { id: "model-chevrolet-cruze", name: "Cruze", yearFrom: 2009, yearTo: 2019 },
      { id: "model-chevrolet-aveo", name: "Aveo", yearFrom: 2003, yearTo: 2020 },
      { id: "model-chevrolet-captiva", name: "Captiva", yearFrom: 2007, yearTo: 2018 },
    ],
  },
  {
    id: "make-ford",
    name: "Ford",
    models: [
      { id: "model-ford-focus", name: "Focus", yearFrom: 2005, yearTo: 2022 },
      { id: "model-ford-fiesta", name: "Fiesta", yearFrom: 2002, yearTo: 2022 },
      { id: "model-ford-kuga", name: "Kuga", yearFrom: 2008, yearTo: 2026 },
    ],
  },
  {
    id: "make-kia",
    name: "Kia",
    models: [
      { id: "model-kia-sportage", name: "Sportage", yearFrom: 2005, yearTo: 2026 },
      { id: "model-kia-ceed", name: "Ceed", yearFrom: 2007, yearTo: 2026 },
      { id: "model-kia-rio", name: "Rio", yearFrom: 2005, yearTo: 2026 },
    ],
  },
  {
    id: "make-nissan",
    name: "Nissan",
    models: [
      { id: "model-nissan-qashqai", name: "Qashqai", yearFrom: 2007, yearTo: 2026 },
      { id: "model-nissan-x-trail", name: "X-Trail", yearFrom: 2003, yearTo: 2026 },
      { id: "model-nissan-leaf", name: "Leaf", yearFrom: 2011, yearTo: 2026 },
    ],
  },
  {
    id: "make-mazda",
    name: "Mazda",
    models: [
      { id: "model-mazda-3", name: "3", yearFrom: 2004, yearTo: 2026 },
      { id: "model-mazda-6", name: "6", yearFrom: 2003, yearTo: 2026 },
      { id: "model-mazda-cx-5", name: "CX-5", yearFrom: 2012, yearTo: 2026 },
    ],
  },
  {
    id: "make-mercedes",
    name: "Mercedes-Benz",
    models: [
      { id: "model-mercedes-c-class", name: "C-Class", yearFrom: 2004, yearTo: 2026 },
      { id: "model-mercedes-e-class", name: "E-Class", yearFrom: 2003, yearTo: 2026 },
      { id: "model-mercedes-glc", name: "GLC", yearFrom: 2016, yearTo: 2026 },
    ],
  },
] as const;

export const seedVehicleCatalog = async (db: Db) => {
  for (const make of CATALOG) {
    await db
      .insert(vehicleMakes)
      .values({ id: make.id, name: make.name })
      .onConflictDoUpdate({
        target: vehicleMakes.name,
        set: { name: make.name },
      });

    for (const model of make.models) {
      await db
        .insert(vehicleModels)
        .values({
          id: model.id,
          makeId: make.id,
          name: model.name,
          yearFrom: model.yearFrom,
          yearTo: model.yearTo,
        })
        .onConflictDoUpdate({
          target: vehicleModels.id,
          set: {
            makeId: make.id,
            name: model.name,
            yearFrom: model.yearFrom,
            yearTo: model.yearTo,
          },
        });
    }
  }

  return { makes: CATALOG.length, models: CATALOG.reduce((sum, make) => sum + make.models.length, 0) };
};
