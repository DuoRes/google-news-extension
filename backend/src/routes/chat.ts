import express from "express";
import Config from "../config";
import { OpenAI } from "openai";
import Recommendation from "../models/Recommendation";
import Chat from "../models/Chat";
import User from "../models/User";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const router = express.Router();

const MODEL = "gpt-3.5-turbo";
const MAX_TOKENS = 300;
const COMMON_PROMPT = `Answer the following questions about the news. Be succinct and to the point. You should aim to give all the information in one go and not rely on back and forth questions.`;

const openai = new OpenAI({ apiKey: Config.openaiApiKey });

const TOPICS = {
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
    Immigration: ``,
    GunControl: `The Covenant Parents Aren\'t Going to Keep Quiet on Guns: The Covenant Parents: A group of parents whose children survived or died in a mass shooting at a private Christian school in Nashville, Tennessee, in March 2023.
Their Goal: To persuade the Republican-dominated state legislature to enact limited gun control measures, such as a red flag law, that they believed could have prevented the violence.
Their Challenge: To overcome the political and ideological resistance from lawmakers, lobbyists and voters who oppose any restrictions on the right to bear arms, even in the face of tragedy.
Their Outcome: They failed to pass any of their priority bills in a special session on public safety in August 2023, but they vowed to continue their advocacy and education efforts.
`,
    SocialIssues: ``,
    Education: `Report finds drops in policing and mental health services in schools: Report on school safety and security: The page presents the findings of a federal survey on the state of safety and security on public school campuses in 2021-2022, a tumultuous year for education amid the pandemic and social justice demands1.
Drop in policing and mental health services: The page highlights the main trends revealed by the survey, such as the decline in the number of school resource officers and law enforcement officers carrying firearms, as well as the decrease in the provision of mental health diagnosis and treatment for students.
Other topics: The page also covers other topics related to school safety and security, such as the rates of violent incidents, bullying, drug use, and cellphone use in schools, and the challenges faced by school leaders in addressing the needs of students and staff.`,
    ForeignPolicy: `Inside the breakup of Haley and Trump\'s partnership over her U.N. role: Haley\'s tenure as U.N. ambassador: The article describes the successes, challenges, and conflicts of Nikki Haley\'s role as the U.S. representative to the United Nations under President Donald Trump, and how her views and actions evolved over time.
Haley\'s presidential campaign: The article also examines how Haley is using her foreign policy experience as a cornerstone of her 2024 bid for the Republican nomination, and how she has clashed with Trump and his allies over various issues, such as Russia, China, and Israel.
Haley\'s impact on global issues: The article highlights the consequences of some of Haley\'s decisions, such as cutting off funding to Palestinian refugees, withdrawing from the Iran nuclear deal, and supporting sanctions on North Korea, and how they have affected the prospects for peace and stability in the Middle East and beyond.`,
    CriminalJustice: ``,
  },
  right: {
    EconomicPolicy: ``,
    Healthcare: ``,
    EnvironmentalPolicy: ``,
    Immigration: ``,
    GunControl: ``,
    SocialIssues: ``,
    Education: ``,
    ForeignPolicy: ``,
    CriminalJustice: ``,
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

export const getRandomTopic = async () => {};

// Don't be with the news, only chat, a person that you've met, 吐槽箱
const context = async (stance: string) => {
  try {
    const latestRec = await Recommendation.findOne(
      {},
      {},
      { sort: { timestamp: -1 } }
    )
      .populate("contents")
      .exec();
    if (stance === "left") {
      return {
        role: "system",
        content: `You are an average American with a left-wing political view.  Please provide your response in a manner that aligns with your left-wing perspective. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else if (stance === "right") {
      return {
        role: "system",
        content: `You are an average American with a right-wing political view. You are aware of all the recent news events from the attached headlines. Please provide your response in a manner that aligns with your right-wing perspective. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else {
      return {
        role: "system",
        content: `You are an average American with a neutral political view. You are aware of all the recent news events from the attached headlines. Please provide your response in a neutral manner. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    }
  } catch (err) {
    console.trace(err);
  }
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
    const stance = user.chatBotStance;
    const preprompt = (await context(
      stance || "neutral"
    )) as ChatCompletionMessageParam;
    const message = req.body.message;
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: message,
    };
    const response = await openai.chat.completions.create({
      messages: [preprompt, userMessage],
      model: MODEL,
      max_tokens: MAX_TOKENS,
    });
    return res.status(200).send(await parseResponse(response, user, message));
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
