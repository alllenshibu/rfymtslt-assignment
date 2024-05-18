import random

# Define an array of full names
names = [
    "John Smith",
    "Jane Johnson",
    "Michael Williams",
    "Emily Brown",
    "David Davis",
    "Sarah Miller",
    "Christopher Wilson",
    "Olivia Anderson",
    "Daniel Taylor",
    "Isabella Thomas",
]

# Define an array of email domains
email_domains = [
    "example.com",
    "test.com",
    "company.net",
    "domain.org",
    "mail.info",
]

# Define an array of locations
locations = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
]

# Generate 10,000 rows of data
data = []
emails = set()
for i in range(10000):
    name, email, phone, location = "", "", "", ""

    # Generate unique email addresses
    while True:
        name = random.choice(names)
        email = f"{name.lower().replace(' ', '.')}@{random.choice(email_domains)}"
        if email not in emails:
            emails.add(email)
            break

    # Randomly include some rows with missing phone numbers or emails
    include_phone = random.random() < 0.9  # 90% chance of including phone number
    include_email = random.random() < 0.9  # 90% chance of including email

    if include_phone:
        phone = f"+1 ({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
    if include_email:
        email = f"{name.lower().replace(' ', '.')}@{random.choice(email_domains)}"

    location = random.choice(locations)
    data.append([name, email, phone, location])

    print({"i": i, "name": name, "email": email, "phone": phone, "location": location})

# Convert the data to a CSV string
csv_data = "\n".join([",".join(row) for row in data])

# Write the CSV data to a file
with open("data.csv", "w") as file:
    file.write(csv_data)
    print("Data saved to data.csv")
