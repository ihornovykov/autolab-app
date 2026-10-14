import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CarIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import { PageHeader } from "@/shared/ui/admin-shell";

type Page<T> = { items: T[]; total: number; totalPages: number };

export const CatalogMakesView = () => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const [name, setName] = useState("");
  const query = useQuery(
    orpc.admin.catalog.listVehicleMakes.queryOptions({
      input: { search: table.search || undefined, page: table.page, pageSize: PAGE_SIZE },
    }),
  );
  const data = query.data as Page<{ id: string; name: string; modelCount: number }> | undefined;
  const create = useMutation(
    orpc.admin.catalog.createVehicleMake.mutationOptions({
      onSuccess: () => {
        setName("");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.catalog.key() });
      },
    }),
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({ name });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Каталог" description="Марки та моделі, з яких майстерні збирають авто" />
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Назва марки"
        page={table.page}
        totalPages={data?.totalPages ?? 0}
        total={data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
        toolbar={
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <Input
              className="w-48"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Нова марка"
              aria-label="Нова марка"
            />
            <Button type="submit" isLoading={create.isPending} disabled={!name.trim()}>
              Додати
            </Button>
          </form>
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Марка</TableHead>
              <TableHead>Моделі</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.items.length ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  Марок не знайдено
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((make) => (
                <TableRow key={make.id}>
                  <TableCell>
                    <NameCell icon={CarIcon}>
                      <Link
                        to="/catalog/makes/$makeId"
                        params={{ makeId: make.id }}
                        className="font-medium hover:underline"
                      >
                        {make.name}
                      </Link>
                    </NameCell>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{make.modelCount}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};

type Props = { makeId: string };

export const CatalogMakeDetailView = ({ makeId }: Props) => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const [name, setName] = useState("");
  const query = useQuery(
    orpc.admin.catalog.listVehicleModels.queryOptions({
      input: { makeId, search: table.search || undefined, page: table.page, pageSize: PAGE_SIZE },
    }),
  );
  const data = query.data as Page<{ id: string; name: string; yearFrom: number | null; yearTo: number | null }> | undefined;
  const create = useMutation(
    orpc.admin.catalog.createVehicleModel.mutationOptions({
      onSuccess: () => {
        setName("");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.catalog.key() });
      },
    }),
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({ makeId, name });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Моделі" description="Моделі обраної марки">
        <Link to="/catalog/makes" className="text-sm text-muted-foreground hover:text-foreground">
          До всіх марок
        </Link>
      </PageHeader>
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Назва моделі"
        page={table.page}
        totalPages={data?.totalPages ?? 0}
        total={data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
        toolbar={
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <Input
              className="w-48"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Нова модель"
              aria-label="Нова модель"
            />
            <Button type="submit" isLoading={create.isPending} disabled={!name.trim()}>
              Додати
            </Button>
          </form>
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Модель</TableHead>
              <TableHead>Роки</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.items.length ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                  Моделей не знайдено
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <NameCell icon={CarIcon}>
                      <span className="font-medium">{model.name}</span>
                    </NameCell>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {model.yearFrom || model.yearTo
                      ? `${model.yearFrom ?? "…"}–${model.yearTo ?? "…"}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};
