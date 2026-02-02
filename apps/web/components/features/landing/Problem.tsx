import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const Problem = ({ copy }: Props) => (
  <section className="flex flex-col gap-4" id="problem">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.problemTitle}
      </h2>
    </div>
    <ul className="m-0 grid list-disc gap-2 pl-4 text-[var(--ns-muted)] rtl:pl-0 rtl:pr-4">
      {copy.problemBullets.map((item) => (
        <li key={item} className="leading-[1.65]">
          {item}
        </li>
      ))}
    </ul>
  </section>
);

export default Problem;
