import { CalendarDaysIcon, ChartColumnIcon, FileTextIcon, UsersIcon } from "lucide-react";

import { Logo } from "@/shared/ui/logo";

const features = [
  {
    icon: CalendarDaysIcon,
    title: "Календар і записи",
    description: "Плануйте зміни, переносьте візити та відстежуйте статус кожного авто",
  },
  {
    icon: UsersIcon,
    title: "Клієнти та автопарк",
    description: "База власників, історія обслуговування та каталог послуг СТО",
  },
  {
    icon: FileTextIcon,
    title: "Акти виконаних робіт",
    description: "Друкуйте документи для клієнта одразу після завершення замовлення",
  },
  {
    icon: ChartColumnIcon,
    title: "Аналітика доходів",
    description: "Дохід, середній чек і завантаженість за обраний період",
  },
] as const;

export const AuthPageAside = () => (
  <>
    <img
      src="/images/background.png"
      alt=""
      className="absolute inset-0 h-full w-full rounded-[12px] object-cover opacity-90 dark:brightness-75"
    />
    <div className="absolute inset-0 rounded-[12px] bg-linear-to-t from-black/80 via-black/45 to-black/15" />
    <div className="absolute inset-0 rounded-[12px] bg-linear-to-tl from-primary/10 via-primary/25 to-transparent" />

    <div className="relative z-10 flex h-full flex-col justify-between p-8">
      <Logo variant="inverse" />

      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Операційна система для СТО
          </p>
          <h2 className="max-w-sm font-heading text-3xl leading-tight font-semibold text-balance text-white">
            Усе для роботи автосервісу в одному місці
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Autolab допомагає керувати записами, командою та фінансами без таблиць і зайвих
            дзвінків.
          </p>
        </div>

        <ul className="space-y-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary backdrop-blur-sm">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs leading-relaxed text-white/65">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-white">Створено для українських автосервісів</p>
    </div>
  </>
);
