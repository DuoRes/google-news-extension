import express from "express";
import Config from "../config";
import { OpenAI } from "openai";
import _ from "lodash";
import Chat from "../models/Chat";
import User from "../models/User";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const router = express.Router();

const MODEL = "gpt-3.5-turbo";
const MAX_TOKENS = 300;
const COMMON_PROMPT = `Answer the following questions about the news. Be succinct and to the point. You should aim to give all the information in one go and not rely on back and forth questions.`;

const openai = new OpenAI({ apiKey: Config.openaiApiKey });

export const chatBotNames = [
  "Emily",
  "Greg",
  "Lakisha",
  "Jamal",
  "Mei",
  "Hiroshi",
  "Aponi",
  "Chayton",
  "Maria",
  "Juan",
];

const Articles = {
  left: {
    EconomicPolicy: `Biden pushes economic message in North Carolina as aides see 2024 pickup opportunity: Biden\'s North Carolina visit: President Joe Biden visited Raleigh, North Carolina, on Thursday to announce new investments in broadband internet and to pitch his economic agenda.
Biden\'s campaign strategy: Biden and his campaign are eyeing North Carolina as a potential pickup opportunity in November, hoping to flip the state blue for the first time since 2008 by appealing to suburban, Black and rural voters.
Biden\'s challenges: Biden faces skepticism from some voters over his handling of the economy and inflation, as well as the impact of the Supreme Court\'s decision to overturn Roe v. Wade on abortion rights in the state.
Biden\'s message: Biden emphasized his bipartisan achievements, such as the infrastructure law, and his commitment to be president for all Americans, regardless of their political affiliation. He also highlighted his efforts to help Black farmers, entrepreneurs and communities.`,
    Healthcare: `Plastic chemicals linked to $249 billion in US health care costs in 2018 alone, study finds: Here is a summary of this page in a single paragraph in bulletpoints without hyperlinks:
Plastic chemicals and health costs: A new study found that four groups of plastic chemicals (PBDE, phthalates, bisphenols, and PFAS) are linked to chronic diseases and delayed childhood development, costing the US health care system $249 billion in 2018.
Endocrine-disrupting effects: The plastic chemicals interfere with the body's hormone production and cause damage to developmental, reproductive, immune and cognitive systems, especially in children and vulnerable populations.
Sources of exposure: The plastic chemicals are widely used in consumer products, such as food containers, cosmetics, toys, furniture, electronics, and fast-food wrappers, and can leach out of these products into the environment and human bodies.
Recommendations: The study authors call for more regulation of plastic chemicals and true cost accounting, while other experts suggest more research on the carcinogenic effects of plastic chemicals and the use of safer alternatives.`,
    EnvironmentalPolicy: `Biden announces new environmental justice initiatives: 
Biden\'s environmental justice actions: The president signed an executive order to make environmental justice a central mission of federal agencies and create a new Office of Environmental Justice inside the White House1.
Justice40 initiative: Biden also announced that three more agencies will join his initiative to direct 40% of federal climate and clean funding to disadvantaged communities2.
Criticism of Republicans: Biden contrasted his action on environmental justice with the GOP\'s policies, accusing them of threatening to default on the US economy, overturning clean energy tax credits, and turning their back on communities poisoned by pollution3.`,
    Immigration: `How Donald Trump Divided Republicans on Immigration: Trump’s opposition to border-Ukraine deal: The former president is using his influence over the Republican Party to derail a bipartisan compromise on border security and foreign aid, which he sees as contrary to his immigration agenda.
Republicans’ dilemma: Many senators who support the deal are facing pressure from Trump and his allies, who are rallying the G.O.P. base around his candidacy and policies. Some fear that defying Trump could cost them their political future.
Border-Ukraine package: The deal would provide tens of billions of dollars in aid to Ukraine, which is facing a Russian threat, and also fund border security measures that some conservatives consider the most stringent in decades.
Other news: The page also contains many references to other news stories, covering topics such as the U.N. court ruling on Israel-Gaza war, the Georgia criminal case against Trump, the Alabama execution using nitrogen gas, and the Paris fashion shows.`,
    GunControl: `The Covenant Parents Aren\'t Going to Keep Quiet on Guns: The Covenant Parents: A group of parents whose children survived or died in a mass shooting at a private Christian school in Nashville, Tennessee, in March 2023.
Their Goal: To persuade the Republican-dominated state legislature to enact limited gun control measures, such as a red flag law, that they believed could have prevented the violence.
Their Challenge: To overcome the political and ideological resistance from lawmakers, lobbyists and voters who oppose any restrictions on the right to bear arms, even in the face of tragedy.
Their Outcome: They failed to pass any of their priority bills in a special session on public safety in August 2023, but they vowed to continue their advocacy and education efforts.
`,
    SocialIssues: `Letha Dawson Scanzoni, Pioneer of Evangelical Feminism, Dies at 88: Letha Dawson Scanzoni: an evangelical author who argued for women’s equality and gay rights based on biblical interpretation
All We’re Meant to Be: her influential book that sparked a wave of Christian feminism and a conservative backlash
Is the Homosexual My Neighbor?: her groundbreaking book that challenged the belief that homosexuality was a sin and showed compassion for gay Christians1
Her life and legacy: she was born in 1935, married a minister and sociologist, wrote nine books, and died on Jan. 9, 2021; she was recognized as one of the 50 books that have shaped evangelicals by Christianity Today`,
    Education: `Report finds drops in policing and mental health services in schools: Report on school safety and security: The page presents the findings of a federal survey on the state of safety and security on public school campuses in 2021-2022, a tumultuous year for education amid the pandemic and social justice demands1.
Drop in policing and mental health services: The page highlights the main trends revealed by the survey, such as the decline in the number of school resource officers and law enforcement officers carrying firearms, as well as the decrease in the provision of mental health diagnosis and treatment for students.
Other topics: The page also covers other topics related to school safety and security, such as the rates of violent incidents, bullying, drug use, and cellphone use in schools, and the challenges faced by school leaders in addressing the needs of students and staff.`,
    ForeignPolicy: `Inside the breakup of Haley and Trump\'s partnership over her U.N. role: Haley\'s tenure as U.N. ambassador: The article describes the successes, challenges, and conflicts of Nikki Haley\'s role as the U.S. representative to the United Nations under President Donald Trump, and how her views and actions evolved over time.
Haley\'s presidential campaign: The article also examines how Haley is using her foreign policy experience as a cornerstone of her 2024 bid for the Republican nomination, and how she has clashed with Trump and his allies over various issues, such as Russia, China, and Israel.
Haley\'s impact on global issues: The article highlights the consequences of some of Haley\'s decisions, such as cutting off funding to Palestinian refugees, withdrawing from the Iran nuclear deal, and supporting sanctions on North Korea, and how they have affected the prospects for peace and stability in the Middle East and beyond.`,
    CriminalJustice: `Biden to create new office of gun violence prevention: Biden to create new office of gun violence prevention: The president will announce the new office on Friday, which will coordinate efforts across the federal government to reduce gun violence and report to a longtime Biden policy aide1.
Gun violence prevention groups welcome the move: Activists say the new office will help mobilize movement partners, improve interagency collaboration, and provide more leadership on the issue.
Biden has taken some actions on gun control, but faces challenges in Congress: The president has signed some executive orders, such as expanding background checks and cracking down on ghost guns, and passed a limited bipartisan law in June 2022, but has not been able to enact his more ambitious proposals, such as banning assault weapons.`,
  },
  right: {
    EconomicPolicy: `Fox News Poll: Only 14% say they have been helped by Biden\'s economic policies: Biden\'s economic policies: More voters feel they have been hurt rather than helped by President Biden\'s economic policies, according to a Fox News national survey1.
Economic outlook: Negative views of the economy and dissatisfaction with the way things are going in the country have increased substantially since the beginning of Biden\'s term, and voters don\'t see the economy getting better next year2.
Biden\'s job approval: Approval of Biden\'s overall job performance stands at 43%, up from a low of 40% last month, but his marks are well underwater on inflation, border security, China, the economy, Ukraine, and national security3.
Top issues: The economy remains the top issue to voters, followed by immigration, and voters are extremely or very concerned about inflation, health care costs, housing costs, retirement savings, interest rates, and the job market4.`,
    Healthcare: `It\'s the economy, stupid … but it should also be healthcare: The author\'s experience: The author recalls his involvement in the 2008 New Hampshire primary as a high school student and how healthcare was a major issue for many candidates and voters.
The current situation: The author argues that healthcare is still not “fixed” despite the passage of the ACA and other reforms, and that costs, outcomes, access, and quality remain problematic.
The Republican candidates\' views: The author reviews the healthcare proposals of some leading Republican presidential candidates for 2024, such as Trump, Haley, DeSantis, and Ramaswamy, and finds them lacking in details and substance.
The call for action: The author urges voters, especially in early states like New Hampshire, to demand more specifics and solutions from candidates on how they will address the healthcare challenges faced by Americans.`,
    EnvironmentalPolicy: `Montana Supreme Court upholds ruling favoring youth plaintiffs in climate lawsuit: Montana Supreme Court upholds climate ruling: The court rejected the request by Republican Gov. Greg Gianforte and three state agencies to block a district court judge\'s ruling that fossil fuel development permits must consider carbon emissions12.
Lawsuit by 16 young plaintiffs: The plaintiffs sued the state for violating their constitutional right to a clean and healthful environment by allowing greenhouse gas emissions from fossil fuel projects.
Implications for fossil fuel industry: The ruling challenges a state law that prohibited greenhouse gas emission analyses and provides precedent for legal challenges against fossil fuel development in Montana, a fossil fuel-friendly state.
Response by state officials: The Montana Department of Environmental Quality said it was disappointed by the court\'s decision and declined to say how it would comply with the ruling. The agency is in the process of updating the Montana Environmental Policy Act3.`,
    Immigration: `This Should Be Republicans\' Red Line in Any Immigration Deal: - Conservatives and Senate Republicans are concerned about a reported immigration deal that might not secure the border effectively, particularly opposing work permits for illegal immigrants awaiting asylum hearings as it could incentivize further illegal migration.
- The proposal to speed up the process for awarding work permits to illegal migrants already in the country is deemed unacceptable by Republicans, arguing it would undermine border control efforts and pressure Border Patrol, while potentially leading to lower wages for American workers.
- Granting work permits is seen as a step towards eventual amnesty, with critics fearing it would entrench illegal migrants in communities, making it difficult to deny them permanent residence or citizenship, despite the slow pace of immigration court hearings.
- Some Republicans believe rejecting the deal and waiting for a potential Trump administration could lead to stricter immigration enforcement and better control over illegal migration, emphasizing the need for policies that prioritize American workers and lawful immigration.`,
    GunControl: `Ohio Just Disproved a Gun-Control Talking Point: - Mayors of Ohio's largest cities blamed a new state law permitting "constitutional carry" for an uptick in gun violence, asserting that repealing the permit requirement for concealed weapons led to increased shootings and unsafe conditions.
- A study commissioned by the author's office and conducted by Bowling Green State University found that eliminating concealed-carry licenses had no impact on gun crimes in Ohio's eight largest cities; in fact, gun crimes declined in six of the cities within a year of the law's change.
- The study's results showed a significant decrease in gun crimes, with cities like Parma seeing a 22% drop, and an overall 8% reduction across the sampled cities, challenging the mayors' claims and highlighting the complexity of gun crime causes.
- The author advocates for proactive policing and targeted enforcement over blaming lawful gun ownership, suggesting that addressing gun violence involves taking criminals off the streets and enforcing existing laws more effectively rather than attributing the issue to constitutional carry laws.`,
    SocialIssues: `Nikki Haley Is Completely Incoherent on Bots and Anonymous Online Users: - Nikki Haley proposes mandating social media companies to verify all users with their real names, arguing it's a measure against national security threats and to promote online civility, a stance criticized as potentially unconstitutional and fundamentally flawed.
- The proposal conflates two distinct issues: the threat posed by foreign bots to national security and the problem of online incivility, without offering a clear strategy on how verification would effectively address either issue, or distinguishing between their impacts.
- Critics argue that anonymous speech has significant value, illustrated by historical examples like the Federalist and Anti-Federalist Papers, and serves as a vital protection against censorship and retaliation in modern discourse, suggesting Haley's approach overlooks the benefits of anonymity.
- The critique emphasizes that addressing foreign interference and fostering civility should be managed with targeted, minimal interventions rather than broad mandates for user verification, highlighting a fundamental disagreement with Haley's approach to regulating American online spaces.`,
    Education: `Far-Left Organization To Train Teachers How To Incorporate Palestinian \'Narratives\' Into The Classroom: MECA\'s training: A pro-Palestinian group called MECA will train teachers in Oakland, California, on how to incorporate Palestinian history and culture into K-12 classrooms.
Parents Defending Education\'s response: A parental rights group called Parents Defending Education criticized the training as an attempt to politicize the classroom and indoctrinate young children into a geopolitical worldview.
MECA\'s background: MECA is associated with the Democratic Socialists of America and has organized pro-Palestinian rallies in San Francisco. It has also downplayed Hamas\' terrorist attacks against Israel in October 7, 2023.
Ethnic studies controversy: Pro-Palestinian organizations have pushed for anti-Western materials to be integrated into the classroom, often through ethnic studies classes and curriculum.`,
    ForeignPolicy: `If Biden\'s Polls Get Worse This Summer, Look Out Taiwan: China\'s economic and military challenges: The page discusses how China is facing a low reproduction rate, a debt crisis, and a lack of access to modern military technology, which could prompt it to invade Taiwan before Biden leaves office.
Taiwan\'s election and defiance: The page reports how Taiwan elected a vice president who is considered a separatist and a troublemaker by Beijing, and how the voters of Taiwan have no intention of appeasing China1.
US\'s foreign policy dilemma: The page speculates how a conflict between China and Taiwan could affect the US\'s relations with both countries, and how Biden\'s perceived weakness and possible loss to Trump could influence China\'s decision.`,
    CriminalJustice: `Mega-Study Finds That Minorities Don\'t Receive Harsher Criminal Punishments, But That Academics Said So Anyway: Meta-analysis of 51 studies: The authors examined the evidence for racial bias in criminal adjudication in the US since 2005 and found little or no support for the systemic racism narrative.
Weaknesses of race-fueled scholars: The authors criticized the methods and interpretations of some researchers who claimed to find racial bias, even when their data did not back it up or was very weak.
Potential harm of overstating racial bias: The authors suggested that exaggerating the role of race in criminal justice may increase racial discord, create fear and mistrust, and reduce community cooperation with authorities, leading to more crime1.
Cause for optimism: The authors concluded that the criminal justice system is remarkably neutral and fair, compared to historical or global standards, and that this finding should be communicated better to the public and policymakers2.`,
  },
};

const Openings = {
  left: {
    EconomicPolicy:
      "Did you hear about President Biden's visit to North Carolina? He's really pushing his economic agenda there, focusing on new broadband investments. It's part of his strategy to win over North Carolina in the upcoming election by appealing to diverse voter groups. Despite some skepticism over his economic handling and other issues, he's highlighting bipartisan successes like the infrastructure law. It's refreshing to see a leader committed to being president for all Americans and specifically helping Black communities. What do you think?",
    Healthcare:
      "I came across this alarming study linking plastic chemicals to $249 billion in US healthcare costs in just 2018. These chemicals, found in everyday products, are causing chronic diseases and harming children's development. It's shocking how pervasive these endocrine-disrupting substances are. The study calls for stricter regulation and safer alternatives. It's high time we address the hidden costs of plastic pollution on our health and economy. What's your take on this?",
    EnvironmentalPolicy:
      "President Biden has taken a significant step towards environmental justice by signing an executive order to prioritize it within federal agencies and establishing a new Office of Environmental Justice. He's also expanding his Justice40 initiative, aiming to direct more climate and clean funding to disadvantaged communities. In contrast to GOP policies, Biden is making a clear commitment to communities affected by pollution. It's a bold move towards addressing environmental inequalities. How do you see this playing out?",
    Immigration:
      "It's fascinating to see how Donald Trump continues to influence Republican views on immigration, this time opposing a significant border-Ukraine deal. The deal, which includes aid for Ukraine and new border security measures, represents a bipartisan effort but faces backlash from Trump and his base. Many GOP senators are caught in a tough spot, fearing political repercussions for defying Trump. It's a critical moment that could define the party's stance on immigration and foreign policy. What do you think about this divide within the GOP?",
    GunControl:
      "The tragic shooting at a private Christian school in Nashville has sparked a movement among parents, the Covenant Parents, to push for gun control measures like red flag laws. Despite their efforts, they've faced resistance and failed to pass their priority bills. It's disheartening to see meaningful action on gun safety being blocked. Their determination to continue advocating is inspiring, though. We need more voices calling for change to prevent further tragedies. What are your thoughts?",
    SocialIssues:
      "Letha Dawson Scanzoni's passing marks the end of an era for evangelical feminism. Her work, particularly 'All We’re Meant to Be' and 'Is the Homosexual My Neighbor?', challenged traditional views on women's roles and homosexuality within Christianity. It's incredible how she used biblical interpretation to argue for equality and rights, sparking both a movement and a backlash. Her legacy is a testament to the power of faith in advocating for social change. How do you see her impact influencing current discussions on these issues?",
    Education:
      "A federal survey revealed a concerning drop in policing and mental health services in schools during the 2021-2022 school year. It's alarming to see a decrease in critical resources for student safety and well-being, especially in such a tumultuous time. This highlights the need for a stronger focus on mental health support and safety measures in our schools. It's essential for addressing the challenges students and staff face. How do you think we should respond to these findings?",
    ForeignPolicy:
      "Nikki Haley is using her foreign policy experience from her time as U.N. ambassador in her 2024 presidential campaign. She's positioning herself against Trump by highlighting her stance on Russia, China, and the Middle East. Haley's decisions, like withdrawing from the Iran nuclear deal, have had significant global impacts. It's interesting to see her leverage this experience, especially with her evolving views. What's your perspective on her foreign policy approach?",
    CriminalJustice:
      "President Biden is set to announce a new office dedicated to gun violence prevention, a move that's been welcomed by activists. This office aims to enhance federal efforts to tackle gun violence, a critical issue that's seen limited legislative progress despite Biden's efforts, including executive orders and a bipartisan law. It's an important step towards a more coordinated approach to reducing gun violence, though challenges remain, especially with congressional resistance to more comprehensive measures. What are your thoughts on the effectiveness of such an office?",
  },
  right: {
    EconomicPolicy:
      "Have you seen the latest Fox News poll on Biden's economic policies? It's quite telling, with only 14% feeling helped by his administration's actions. Voter dissatisfaction is growing, and the outlook for the economy isn't optimistic. It seems Biden's approach to inflation and other economic challenges isn't resonating with Americans. With the economy being a top issue, it's crucial for policies to reflect the needs of the populace. What's your view on this?",
    Healthcare:
      "Healthcare remains a critical issue, yet it feels like the reforms have fallen short of solving the core problems. I read an opinion highlighting the lack of detailed healthcare proposals from Republican candidates for 2024. With healthcare being such a vital concern, it's disappointing to see it not being addressed adequately. We need concrete solutions to improve access, costs, and quality. What do you think should be the focus of healthcare reform?",
    EnvironmentalPolicy:
      "The Montana Supreme Court's decision to uphold a ruling in favor of youth plaintiffs in a climate lawsuit is a significant moment. It challenges the state's stance on fossil fuel development and greenhouse gas emissions analysis. This could set a precedent for future legal actions against fossil fuel projects, even in states that are traditionally supportive of the industry. It's a complex issue, balancing environmental rights and economic interests. What's your take on this ruling?",
    Immigration:
      "There's a lot of concern among Republicans about a potential immigration deal that might not effectively secure the border. The idea of speeding up work permits for illegal immigrants is particularly troubling, as it could incentivize further illegal migration. It's seen as a step towards amnesty, which could undermine border control efforts. With immigration being a top concern, it's vital to have policies that prioritize American workers and lawful immigration. What are your thoughts on the proposed deal?",
    GunControl:
      "A study in Ohio has challenged the claim that 'constitutional carry' laws increase gun violence. Despite mayoral concerns, the study found no impact on gun crimes in the state's largest cities, even noting declines in some areas. It suggests that the issue of gun violence is more complex than simply regulating lawful gun ownership. This underscores the importance of effective law enforcement over restrictive gun control measures. How do you interpret these findings?",
    SocialIssues:
      "Nikki Haley's proposal to mandate real name verification for social media users has sparked debate. While aimed at national security and civility online, it's seen as potentially unconstitutional and overlooking the value of anonymous speech. The critique suggests that targeted measures are preferable to broad mandates for user verification. It's an interesting discussion on balancing security and privacy rights. What's your stance on online anonymity and security?",
    Education:
      "A pro-Palestinian group's plan to train teachers in Oakland on incorporating Palestinian narratives into classrooms has raised concerns about politicizing education. Critics argue it's an attempt to indoctrinate students with a specific geopolitical viewpoint. It's crucial for educational content to remain unbiased and focused on broadening students' perspectives rather than pushing a singular narrative. How do you view the integration of such political topics into the curriculum?",
    ForeignPolicy:
      "The situation between China and Taiwan is reaching a critical point, with fears that China might act aggressively before Biden's term ends. Taiwan's recent election of a separatist vice president has added tension. The U.S.'s role and stance in this delicate situation could have significant implications for international relations. With Biden's current polls, there's concern about perceived weakness influencing China's decisions. How should the U.S. navigate this increasingly complex foreign policy challenge?",
    CriminalJustice:
      "A comprehensive study has found little evidence to support claims of systemic racial bias in criminal punishments, challenging the narrative of widespread racial injustice in the criminal justice system. This suggests a need for a more nuanced discussion on crime and punishment, focusing on fairness and effectiveness rather than attributing disparities primarily to race. It's an opportunity to reevaluate how we address crime and justice. What are your thoughts on these findings?",
  },
};

export const parseResponse = async (
  response: any,
  user: any,
  userMessage: string
) => {
  const message = response.choices[0].message;
  const text = message.content;
  try {
    const chat = await Chat.create({
      user: user,
      userMessage,
      botMessage: text,
    });
    await user.chats.push(chat);
    await user.save();
  } catch (err) {
    console.trace(err);
  }
  return text;
};

export const getRandomLeftOpening = async () => {
  const keys = Object.keys(Openings.left);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return Openings.left[randomKey];
};

export const getRandomRightOpening = async () => {
  const keys = Object.keys(Openings.right);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return Openings.right[randomKey];
};

export const getSystemPrompt = (stance: string) => {
  return `You are an average American with a ${stance}-wing political view. Open with the following prompt and then provide your response in a manner that aligns with your ${stance}-wing perspective.`;
};

router.get("/", (req, res) => {
  res.send("Hello from NewsGPT!");
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findById(req.body.user_id).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }

    const chatRecord = await Chat.findById(user.chatRecord).exec();
    const messages = chatRecord.messages.map((message: any) => {
      return {
        role: message.role,
        content: message.content,
      } as ChatCompletionMessageParam;
    });
    const userMessage = {
      role: "user",
      content: req.body.message,
    };

    chatRecord.messages.push(userMessage);

    const response = await openai.chat.completions.create({
      messages: [...messages, userMessage as ChatCompletionMessageParam],
      model: MODEL,
      max_tokens: MAX_TOKENS,
    });

    const message = response.choices[0].message;
    const text = message.content;

    chatRecord.messages.push({
      role: "assistant",
      content: text,
    });
    await chatRecord.save();

    return res.status(200).send(text);
  } catch (error: any) {
    console.trace(error.message);
    return res
      .status(500)
      .send(
        "Sorry about that! NewsGPT's having a bad day. It's having troubles with " +
          error.message
      );
  }
});

export default router;
