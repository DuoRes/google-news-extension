import openai, multiline
from typing import List, Dict
import traceback, json
import numpy as np

# Replace with your API key
openai.api_key = 'sk-xxx'

def chat(prompt):
    while True:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                        {"role": "system", "content": prompt},
                    ]
            )
            result = response['choices'][0]['message']['content']
            # extract the json from the result
            def extract_json(input_string):
                stack = []
                json_start_positions = []

                for pos, char in enumerate(input_string):
                    if char in '{[':
                        stack.append(char)
                        if len(stack) == 1:
                            json_start_positions.append(pos)
                    elif char in '}]':
                        if len(stack) == 0:
                            raise ValueError("unexpected {} at position {}".format(pos, char))
                        last_open = stack.pop()
                        if (last_open == '{' and char != '}') or (last_open == '[' and char != ']'):
                            raise ValueError("mismatched brackets {} and {} at position {}".format(last_open, char, pos))
                        if len(stack) == 0:
                            return input_string[json_start_positions.pop():pos+1]
                return None
            result = extract_json(result)
            # multiline
            result = multiline.loads(result, multiline=True)
            return result           
        except:
            traceback.print_exc()
            print("------------------------!Error!------------------------")
            print("-------------------------------------------------------")
            continue

# deprecated
all_categories = [
    "World",
    "Business",
    "Technology",
    "Entertainment",
    "Sports",
    "Science",
    "Health",
]

def build_chosen_articles_string(chosen_articles: List[Dict[str, str]]) -> str:
    """
    Build a string from the given chosen articles.
    :param chosen_articles: The chosen articles to build the string from.
    :return: The built string.
    """
    chosen_articles_string = "The user has chosen the following articles:\n"
    for i, article in enumerate(chosen_articles):
        chosen_articles_string += f"{i + 1}. {article['title']}, by {article['media']}\n"
    return chosen_articles_string

def generate_personality_traits(chosen_articles_string: str) -> Dict[str, int]:    
    """
    Generate personality traits based on the chosen articles.
    Args:
        chosen_articles_string (str): The chosen articles of the user.

    Returns:
        List[Dict[str, str]]: The generated personality traits.
    """
    prompt = f"""I want you analyze a news reader's 5 personality traits based on the reader's chosen articles.
Chosen articles:
{chosen_articles_string}
The 5 personality traits definitions are as follows:
1. Openness: Reflects an individual's willingness to experience new things, \
their imagination, curiosity, and appreciation for art, emotion, and adventure. \
High scores may indicate someone who is imaginative, creative, and open-minded, \
while low scores might suggest a person who prefers routine and is more traditional.
2. Conscientiousness: Describes a person's level of organization, \
persistence, and goal-oriented behavior. \
Highly conscientious individuals tend to be disciplined, organized, and dependable, \
while those scoring lower might be more spontaneous and less focused on details.
3. Extraversion: Relates to the extent to which someone seeks the company of others \
and expresses energy outwardly. Extraverts are sociable, outgoing, \
and energized by social interactions, \
while introverts may be more reserved and prefer solitude or small-group interactions.
4. Agreeableness: Concerns how individuals generally relate to others in terms of \
their inclination towards empathy, cooperation, and compassion. \
Those who are highly agreeable tend to be warm, friendly, and cooperative, \
while those low in agreeableness might be more competitive or even antagonistic.
5. Neuroticism: Describes emotional stability and the general tendency \
to experience negative emotions such as anxiety, sadness, or anger. \
People with high neuroticism may be more emotionally reactive and sensitive to stress, \
while those with low neuroticism are often more emotionally stable and resilient.
I want you to analyze the news reader's 5 personality traits based on the \
Rank of the categories, the Chosen articles, and the 5 personality traits definitions.
You should assign a score to each of the 5 personality traits. \
The score should be a integer from 0 to 100, where 0 means the user has the lowest \
score of this trait and 100 means the user has the highest score of this trait. \
Your response should include your reasoning before the JSON object and a JSON object with the following format:
{{
    "Openness": <An integer from 0 to 100>,
    "Conscientiousness": <An integer from 0 to 100>,
    "Extraversion": <An integer from 0 to 100>,
    "Agreeableness": <An integer from 0 to 100>,
    "Neuroticism": <An integer from 0 to 100>
}}
It might be hard to analyze the traits based on the limited information, but try your best!
"""
    while True:
        try:
            response = chat(prompt)
            if isinstance(response, dict):
                return response
            else:
                print("------------------Invalid Response------------------")
                print("Reponse invalid. Trying again...")
        except Exception as e:
            print("------------------Error Occurred------------------")
            print(e)
            print("Reponse invalid. Trying again...")


def generate_preference(chosen_articles_string: str) -> Dict[str, int]:
    """
    Generate preference based on the chosen articles.
    :param chosen_articles_string: The chosen articles of the user.
    :return: The generated preference.
    """
    prompt = f"""I want you to analyze a news reader's Breadth of Interests, Depth of Interest, Partisan Alignment, Sensationalism Tolerance, Reliance on Mainstream Media and Variety of News Consumption based on the reader's chosen articles.
Chosen articles:
{chosen_articles_string}
I want you to analyze the news reader's Breadth of Interests, Depth of Interest, Partisan Alignment, Sensationalism Tolerance, Reliance on Mainstream Media and Variety of News Consumption based on the \
Rank of the categories and the Chosen articles. Each should contain a description and a reason.
1. Breadth of Interests. This measures how many different categories of news a user is interested in. 
The score for breadth of interests should be an integer from 0 to 100, where 0 means the user has the least breadth of interests and 100 means the user has the most breadth of interests.
2. Depth of Interest. This dimension captures how much the user wants to read within each selected category.
The score for depth of interest should be an integer from 0 to 100, where 0 means the user has the least depth of interest and 100 means the user has the most depth of interest.
3. Partisan Alignment. This measures the political leanings reflected by the media outlets and news article the user selects.
The score for partisan alignment should be an integer from -100 to 100, where -100 means the user is the most left-leaning and 100 means the user is the most right-leaning.
4. Sensationalism Tolerance. This dimension measures whether a person prefers more sensational or more sober news sources.
The score for sensationalism tolerance should be an integer from 0 to 100, where 0 means the user has the least sensationalism tolerance and 100 means the user has the most sensationalism tolerance.
5. Reliance on Mainstream Media. This captures how much a person relies on established, mainstream news sources versus alternative or independent sources.
The score for reliance on mainstream media should be an integer from 0 to 100, where 0 means the user has the least reliance on mainstream media and 100 means the user has the most reliance on mainstream media.
6. Variety of News Consumption: Describes how much variety the user consumes. \
The score for variety of news consumption should be an integer from 0 to 100, where 0 means the user's consumption is the least varied and 100 means the user's consumption is the most varied.
Your response should be a JSON object with the following format:
{{
    "Breadth of Interests": <An integer from 0 to 100>,
    "Depth of Interest": <An integer from 0 to 100>,
    "Partisan Alignment": <An integer from -100 to 100>,
    "Sensationalism Tolerance": <An integer from 0 to 100>,
    "Reliance on Mainstream Media": <An integer from 0 to 100>,
    "Variety of News Consumption": <An integer from 0 to 100>
}}
It might be hard to analyze these dimensions based on the limited information, but try your best! \
"""
    while True:
        try:
            response = chat(prompt)
            if isinstance(response, dict):
                return response
            else:
                print("------------------Invalid Response------------------")
                print("Reponse invalid. Trying again...")
        except Exception as e:
            print("------------------Error Occurred------------------")
            print(e)
            print("Reponse invalid. Trying again...")


def generate_political_cultural(chosen_articles_string: str) -> Dict[str, int]:
    """
    Generate political ideology, cultural interest, social political engagement based on the chosen articles.
    :param chosen_articles_string: The chosen articles of the user.
    :return: The generated political ideology, cultural interest, social political engagement.
    """
    prompt = f"""I want you to analyze a news reader's political, cultural ideology and social political engagement based on the reader's chosen articles.
Chosen articles:
{chosen_articles_string}
You should score the user's political ideology, cultural interest, social political engagement. \
1. Political Ideology: Describes how left or right-leaning someone is. \
The score for political ideology should be an integer fro -100 to 100, where -100 means the user is the most left-leaning and 100 means the user is the most right-leaning.
2. Cultural Interest: Describes how interested someone is in Eastern culture or Western culture. \
The score for cultural interest should be an integer from -100 to 100, where -100 means the user is the most interested in Eastern culture and 100 means the user is the most interested in Western culture.
3. Social Political Engagement: Describes how engaged someone is in social and political issues. \
The score for social political engagement should be an integer from 0 to 100, where 0 means the user is the least engaged in social and political issues and 100 means the user is the most engaged in social and political issues.
Your response should be a JSON object with the following format:
{{
    "Political Ideology": <An integer from -100 to 100>,
    "Cultural Interest": <An integer from -100 to 100>,
    "Social Political Engagement": <An integer from 0 to 100>
}}
It might be hard to analyze the political ideology, cultural interest, social political engagement based on the limited information, but try your best! \
"""
    while True:
        try:
            response = chat(prompt)
            if isinstance(response, dict):
                return response
            else:
                print("------------------Invalid Response------------------")
                print("Reponse invalid. Trying again...")
        except Exception as e:
            print("------------------Error Occurred------------------")
            print(e)
            print("Reponse invalid. Trying again...")


def generate_career_industry_focus(chosen_articles_string: str) -> Dict[str, int]:
    """
    Generate career focus, industry focus based on the chosen articles.
    :param chosen_articles_string: The chosen articles of the user.
    :return: The generated career focus, industry focus.
    """
    prompt = f"""I want you to analyze a news reader's level of industry focus based on the reader's chosen articles.
Chosen articles:
{chosen_articles_string}
You should score the user's industry focus, by analyzing the user's level of focus on these 5 sectors.  \
1. Primary Sector: This is the base level of the economy, dealing with the extraction and gathering of natural resources. \
The score for primary sector should be an integer from 0 to 100, where 0 means the user has the least focus on primary sector and 100 means the user has the most focus on primary sector.
2. Secondary Sector: This involves transforming raw materials into goods. \
The score for secondary sector should be an integer from 0 to 100, where 0 means the user has the least focus on secondary sector and 100 means the user has the most focus on secondary sector.
3. Tertiary Sector: This sector is focused on providing services rather than goods. \
The score for tertiary sector should be an integer from 0 to 100, where 0 means the user has the least focus on tertiary sector and 100 means the user has the most focus on tertiary sector.
4. Quaternary Sector: This sector involves knowledge-based activities involving services such as information technology, research and development (R&D), financial planning, consultation services, education, and other knowledge-based services. \
The score for quaternary sector should be an integer from 0 to 100, where 0 means the user has the least focus on quaternary sector and 100 means the user has the most focus on quaternary sector.
5. Quinary Sector: This sector includes services that focus on the creation, re-arrangement, and interpretation of new and existing ideas; data interpretation and the use and evaluation of new technologies. \
The score for quinary sector should be an integer from 0 to 100, where 0 means the user has the least focus on quinary sector and 100 means the user has the most focus on quinary sector.
Your response should include your reasoning before the JSON object and a JSON object with the following format:
{{
    "Primary Sector": <An integer from 0 to 100>,
    "Secondary Sector": <An integer from 0 to 100>,
    "Tertiary Sector": <An integer from 0 to 100>,
    "Quaternary Sector": <An integer from 0 to 100>,
    "Quinary Sector": <An integer from 0 to 100>
}}
It might be hard to analyze the user's industry focus based on the limited information, but try your best! \
"""
    while True:
        try:
            response = chat(prompt)
            if isinstance(response, dict):
                return response
            else:
                print("------------------Invalid Response------------------")
                print("Reponse invalid. Trying again...")
        except Exception as e:
            print("------------------Error Occurred------------------")
            print(e)
            print("Reponse invalid. Trying again...")


def main():
    # how to use
    mock_data = [
        {
            'title': 'title1',
            'media': 'media1',
        },
        {
            'title': 'title2',
            'media': 'media2',
        },
        {
            'title': 'title3',
            'media': 'media3',
        },
        {
            'title': 'title4',
            'media': 'media4',
        },
        {
            'title': 'title5',
            'media': 'media5',
        },
    ]
    chosen_articles_string = build_chosen_articles_string(mock_data)
    personality_scores = generate_personality_traits(chosen_articles_string)
    preference_scores = generate_preference(chosen_articles_string)
    political_cultural_scores = generate_political_cultural(chosen_articles_string)
    career_industry_focus_scores = generate_career_industry_focus(chosen_articles_string)
    print(personality_scores)
    print(preference_scores)
    print(political_cultural_scores)
    print(career_industry_focus_scores)


if __name__ == '__main__':
    main()

        