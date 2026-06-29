import { IBM_Plex_Mono, Montserrat } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

interface Member {
  role: string;
  name: string;
  img: string | null;
  /** full = zoom for full-body outdoor shots; medium/tight = already closer framing */
  frame?: "full" | "medium" | "tight";
}

interface Team {
  label: string;
  members: Member[];
}

const PHOTO_FRAMES = {
  full: { scale: 1.9, objectPosition: "50% 38%" },
  medium: { scale: 1.28, objectPosition: "50% 44%" },
  tight: { scale: 1.05, objectPosition: "50% 48%" },
} as const;

function MemberPhoto({ member }: { member: Member }) {
  const frame = member.frame ?? "full";
  const { scale, objectPosition } = PHOTO_FRAMES[frame];

  return (
    <div className="w-full aspect-[3/4] bg-[#ddd8cf] border border-[#ccc7bd] overflow-hidden">
      {member.img ? (
        <img
          src={member.img}
          alt={member.name}
          className="w-full h-full object-cover"
          style={{
            objectPosition,
            transform: `scale(${scale})`,
            transformOrigin: objectPosition,
          }}
        />
      ) : null}
    </div>
  );
}

const TEAMS: Team[] = [
  {
    label: "EXCO TEAM",
    members: [
      { role: "PRESIDENT", name: "JAYADIPA FUKUTARO", img: "/committee/jayadipa-fukutaro.jpg" },
      { role: "VICE PRESIDENT", name: "MICHELLE CHAN", img: "/committee/michelle-chan.jpg" },
      { role: "SECRETARY", name: "REYNALDI ARDIANTO WIYOGO", img: "/committee/reynaldi-ardianto.jpg", frame: "medium" },
      { role: "TECHNICAL DIRECTOR", name: "YAN MEI WONG", img: "/committee/yan-mei-wong.jpg", frame: "medium" },
      { role: "TECHNICAL DIRECTOR", name: "DESMOND", img: "/committee/desmond.jpg" },
      { role: "MARKETING DIRECTOR", name: "VANNESS YANG", img: "/committee/vanness-yang.jpg" },
      { role: "PARTNERSHIPS DIRECTOR", name: "WINSTON FAUSTIN", img: "/committee/winston-faustin.jpg" },
    ],
  },
  {
    label: "DEV TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "LEE HAE EUN CHLOE", img: "/committee/chloe.jpg" },
      { role: "SUBCOMMITTEE", name: "VUN KIAN HIUNG", img: "/committee/vun-kian-hiung.jpg" },
      { role: "SUBCOMMITTEE", name: "MOE PYE SONE", img: "/committee/moe-pye-sone.jpg" },
      { role: "SUBCOMMITTEE", name: "CHUA WEE YEE GERALD", img: "/committee/gerald.jpg", frame: "medium" },
      { role: "SUBCOMMITTEE", name: "TAN WEI QUAN", img: "/committee/wei-quan.jpg", frame: "medium" },
      { role: "SUBCOMMITTEE", name: "STANLEY LAURENZ", img: "/committee/stanley-laurenz.jpg", frame: "medium" },
      { role: "SUBCOMMITTEE", name: "VICKY YANG", img: "/committee/vicky-yang.jpg" },
      { role: "SUBCOMMITTEE", name: "NADON PANWONG", img: "/committee/nadon-panwong.jpg", frame: "medium" },
      { role: "SUBCOMMITTEE", name: "AMEER", img: "/committee/ameer.jpg" },
    ],
  },
  {
    label: "MARKETING TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "TEE YI JUN", img: "/committee/tee-yi-jun.jpg" },
      { role: "SUBCOMMITTEE", name: "NITYASHRI MEKA", img: "/committee/nityashri-meka.jpg" },
      { role: "SUBCOMMITTEE", name: "PAING THIT XAN", img: "/committee/paing-thit-xan.jpg" },
      { role: "SUBCOMMITTEE", name: "SWAMINATHAN SHRAVANTHIGA", img: "/committee/shravanthiga.jpg" },
      { role: "SUBCOMMITTEE", name: "AGRACIA YONG YI XIN", img: "/committee/agracia.jpg" },
      { role: "SUBCOMMITTEE", name: "MANIKANDAN SANJUVIGASINI", img: "/committee/sanju.jpg" },
      { role: "SUBCOMMITTEE", name: "ALBERT LIBRANTONO", img: "/committee/albert.jpg" },
      { role: "SUBCOMMITTEE", name: "KIMBERLY", img: "/committee/kimberly.jpg" },
      { role: "SUBCOMMITTEE", name: "HELEN PRIYATNA", img: "/committee/helen.jpg" },
    ],
  },
  {
    label: "PARTNERSHIP & INNOVATION",
    members: [
      { role: "SUBCOMMITTEE", name: "PHOO PWINT WAI", img: "/committee/phoo-pwint-wai.jpg" },
      { role: "SUBCOMMITTEE", name: "SHISA YOSHIHIRO", img: "/committee/shisa-yoshihiro.jpg" },
      { role: "SUBCOMMITTEE", name: "EILEEN LEE", img: "/committee/eileen-lee.jpg" },
      { role: "SUBCOMMITTEE", name: "SU YI MAUNG", img: "/committee/su-yi-maung.jpg" },
      { role: "SUBCOMMITTEE", name: "KARTHIKEYAN SURESH", img: "/committee/karthik.jpg", frame: "medium" },
      { role: "SUBCOMMITTEE", name: "ANG LIJA", img: "/committee/lija.jpg" },
    ],
  },
];

export default function Committee() {
  return (
    <section
      id="organise-members"
      className={`${ibmPlexMono.className} w-full bg-[#f2ede5] px-6 sm:px-10 md:px-14 py-16 sm:py-24 scroll-mt-11`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="w-full h-px bg-[#c5bfb5] mb-16 sm:mb-24" />

        <div className="flex items-center gap-6 mb-10 sm:mb-14">
          <h2
            className={`${montserrat.className} text-[26px] sm:text-[34px] md:text-[40px] font-extrabold tracking-tight text-[#1d1c17] uppercase whitespace-nowrap`}
          >
            ORGANIZING COMMITTEE
          </h2>
          <div className="flex-1 h-px bg-[#c5bfb5]" />
        </div>

        <div className="space-y-12 sm:space-y-16">
          {TEAMS.map((team) => (
            <div key={team.label}>
              <div className="mb-6 sm:mb-8">
                <span className="px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-bold tracking-[0.10em] uppercase bg-[#1d1c17] text-white border border-[#1d1c17] inline-block">
                  {team.label}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4 sm:gap-5">
                {team.members.map((member, i) => (
                  <div key={`${team.label}-${i}`}>
                    <MemberPhoto member={member} />
                    <div className="mt-3 text-[10px] sm:text-[11px] font-bold tracking-[0.10em] text-[#c00000] uppercase">
                      {member.role}
                    </div>
                    <div
                      className={`${montserrat.className} mt-1 text-[13px] sm:text-[15px] font-extrabold tracking-tight text-[#1d1c17] uppercase`}
                    >
                      {member.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
