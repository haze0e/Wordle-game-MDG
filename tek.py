import math

print("--- Birthday Problem Calculator ---")

while True:
    # Ask the user for the value of n
    user_input = input("What value of n do you want? (or type 'quit' to exit): ")
    
    if user_input.lower() == 'quit':
        print("Exiting calculator.")
        break
        
    try:
        n = int(user_input)
        
        # 'n choose 3' requires n to be at least 3
        if n < 3:
            print("Please enter an integer greater than or equal to 3.\n")
            continue
            
        # 1. Calculate Lambda: (n choose 3) * (1 / 365^2)
        # math.comb(n, 3) calculates the binomial coefficient
        lambda_val = math.comb(n, 3) / (365**2)
        
        # 2. Calculate 1 - e^(-lambda)
        answer = 1 - math.exp(-lambda_val)
        
        # Display the results
        print(f"Results for n = {n}:")
        print(f"λ (Lambda) = {lambda_val:.26f}")
        print(f"1 - e^(-λ) = {answer:.26f}\n")
        
    except ValueError:
        print("Invalid input. Please enter a valid integer.\n")