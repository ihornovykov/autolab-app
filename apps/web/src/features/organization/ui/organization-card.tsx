import { Globe, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import { OrganizationLogo } from "@/shared/ui/organization-logo";
import { RoleBadge } from "@/shared/ui/role-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type Organization = {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  role: "TECHNICIAN" | "MANAGER" | "OWNER";
};

type Props = {
  organization: Organization;
  className?: string;
  onClick?: () => void;
};

const formatWebsite = (website: string) => website.replace(/^https?:\/\//, "").replace(/\/$/, "");

type ContactItemProps = {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  href?: string;
};

const ContactItem = ({ icon: Icon, label, value, href }: ContactItemProps) => {
  if (!value) return null;

  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="truncate text-sm font-medium text-primary hover:underline"
    >
      {value}
    </a>
  ) : (
    <p className="truncate text-sm font-medium leading-snug">{value}</p>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50">
        <Icon className="size-4 text-primary/80" />
      </div>
      <div className="min-w-0 flex-1 flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {content}
      </div>
    </div>
  );
};

export const OrganizationCard = ({ organization, className, onClick }: Props) => {
  const hasContactInfo = Boolean(
    organization.address || organization.phone || organization.email || organization.website,
  );

  const websiteHref = organization.website
    ? organization.website.startsWith("http")
      ? organization.website
      : `https://${organization.website}`
    : undefined;

  const websiteLabel = organization.website ? formatWebsite(organization.website) : null;

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden border-border/70 transition-all duration-200",
        onClick &&
          "cursor-pointer hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !onClick && "hover:border-primary/25 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="shrink-0 space-y-0 bg-muted/20 p-4 pb-3">
        <div className="flex items-start gap-3">
          <OrganizationLogo
            name={organization.name}
            image={organization.logo}
            className="size-14 rounded-xl ring-1 ring-border/50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Організація
            </p>
            <CardTitle className="mt-0.5 line-clamp-2 min-h-11 text-lg font-bold leading-tight tracking-tight">
              {organization.name}
            </CardTitle>
            <div className="mt-2.5">
              <RoleBadge role={organization.role} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3.5 p-4 pt-3">
        {organization.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {organization.description}
          </p>
        ) : null}

        <div className="mt-auto rounded-xl border border-border/50 bg-muted/35 px-3 py-3">
          {hasContactInfo ? (
            <div className="space-y-3">
              <ContactItem icon={MapPin} label="Адреса" value={organization.address} />
              <ContactItem icon={Phone} label="Телефон" value={organization.phone} />
              <ContactItem icon={Mail} label="Email" value={organization.email} />
              <ContactItem icon={Globe} label="Сайт" value={websiteLabel} href={websiteHref} />
            </div>
          ) : (
            <div className="flex min-h-16 flex-col items-center justify-center gap-1.5 text-center">
              <div className="flex size-8 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50">
                <MapPin className="size-4 text-muted-foreground/70" />
              </div>
              <p className="text-xs text-muted-foreground">Контактні дані не вказані</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const OrganizationCardSkeleton = () => (
  <Card className="flex h-full w-full flex-col overflow-hidden border-border/70">
    <CardHeader className="shrink-0 space-y-0 bg-muted/20 p-4 pb-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-3.5 p-4 pt-3">
      <Skeleton className="h-10 w-full" />
      <div className="mt-auto space-y-3 rounded-xl border border-border/50 bg-muted/35 px-3 py-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);
