import random

def generate_lotto_numbers():
    numbers = set()
    while len(numbers) < 6:
        numbers.add(random.randint(1, 45))
    return sorted(list(numbers))

if __name__ == "__main__":
    print("행운의 로또 번호:")
    lotto_numbers = generate_lotto_numbers()
    print(lotto_numbers)
