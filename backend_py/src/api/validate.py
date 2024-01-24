import easyocr
import re, os, json

def extract_google_email(image_path, email):
    # Create a reader object
    reader = easyocr.Reader(['en'])

    # Read the text from the image
    results = reader.readtext(image_path)

    # Extract the username from the given email
    username = email.split('@gmail.com')[0]

    # Initialize variables to store extracted email and its confidence
    extracted_email = ""
    confidence = 0

    # Search for the email pattern in the recognized text
    for (bbox, text, prob) in results:
        # Check if '@gmail' is in the text
        if '@gmail' in text:
            # Extract the potential email
            potential_email = re.findall(r'[\w\.-]+@gmail', text)

            # Check if any email was found
            if potential_email:
                # Extract the username from the found email
                extracted_username = potential_email[0].split('@')[0]

                # Calculate the match confidence
                match = sum(1 for a, b in zip(username, extracted_username) if a == b)
                current_confidence = (match / len(username)) * 100

                # Update if the current confidence is higher than the previous ones
                if current_confidence > confidence:
                    extracted_email = extracted_username
                    confidence = current_confidence

    return extracted_email, confidence

def validate():
    for img_info in data:
        img_id = img_info['id']
        print("Processing image: ", img_id)
        img_path = os.path.join('img', img_id+'.png')
        email = img_info['account']
        extracted_email, confidence = extract_google_email(img_path, email)
        results.append({
            'id': img_id,
            'email': email.split('@')[0],
            'extracted_email': extracted_email,
            'confidence': confidence
        })

    with open('result.json', 'w') as f:
        json.dump(results, f, indent=4)

    
if __name__ == '__main__':
    main()