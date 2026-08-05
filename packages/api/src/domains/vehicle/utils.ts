import { db } from "@autolab/db";
import { vehicleModels } from "@autolab/db/schema/vehicle";
import { env } from "@autolab/env/server";
import { eq } from "drizzle-orm";
import ky from "ky";

const CATEGORY_ID = 1;

type AutoriaItem = { value: number; name: string };

type CatalogModel = {
  id: string;
  name: string;
  yearFrom: number | null;
  yearTo: number | null;
};

const fetchAutoria = async (path: string): Promise<AutoriaItem[]> => {
  const apiUrl = env.AUTORIA_API_URL;
  const apiKey = env.AUTORIA_API_KEY;

  if (!apiUrl || !apiKey) return [];

  try {
    const data = await ky
      .get(`${apiUrl}${path}`, { searchParams: { api_key: apiKey } })
      .json<AutoriaItem[]>();

    if (!Array.isArray(data)) return [];

    return data.filter((item) => item.value != null && item.name);
  } catch {
    return [];
  }
};

const mapAutoriaModels = (items: AutoriaItem[]): CatalogModel[] =>
  items.map((item) => ({
    id: String(item.value),
    name: item.name,
    yearFrom: null,
    yearTo: null,
  }));

export const resolveModels = async (makeId: string): Promise<CatalogModel[]> => {
  const autoriaModels = await fetchAutoria(
    `/auto/categories/${CATEGORY_ID}/marks/${makeId}/models`,
  );

  if (autoriaModels.length > 0) {
    return mapAutoriaModels(autoriaModels);
  }

  const dbModels = await db.query.vehicleModels.findMany({
    where: eq(vehicleModels.makeId, makeId),
    orderBy: (model, { asc }) => [asc(model.name)],
  });

  if (dbModels.length > 0) {
    return dbModels.map((model) => ({
      id: model.id,
      name: model.name,
      yearFrom: model.yearFrom,
      yearTo: model.yearTo,
    }));
  }

  return [];
};
