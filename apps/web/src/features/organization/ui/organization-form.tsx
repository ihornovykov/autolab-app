import { useForm } from "@tanstack/react-form";

import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import { Textarea } from "@autolab/ui/components/textarea";

type Props = {
  onSubmit: (values: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => void;
  isSubmitting?: boolean;
  embedded?: boolean;
};

export const OrganizationForm = ({ onSubmit, isSubmitting, embedded }: Props) => {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        name: value.name,
        description: value.description || undefined,
        address: value.address || undefined,
        phone: value.phone || undefined,
        email: value.email || undefined,
      });
      form.reset();
    },
  });

  return (
    <form
      className={
        embedded
          ? "space-y-4"
          : "max-w-xl space-y-4 rounded-lg border bg-background p-4"
      }
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {embedded ? null : (
        <h3 className="font-heading text-sm font-semibold">Створити організацію</h3>
      )}
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Назва *</Label>
            <Input
              id={field.name}
              placeholder="AutoLab СТО"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
          </div>
        )}
      </form.Field>
      <form.Field name="address">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Адреса</Label>
            <Input
              id={field.name}
              placeholder="вул. Хрещатик, 1, Київ"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Опис</Label>
            <Textarea
              id={field.name}
              placeholder="Короткий опис вашої організації та послуг"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      <Button type="submit" disabled={isSubmitting}>
        Створити
      </Button>
    </form>
  );
};
