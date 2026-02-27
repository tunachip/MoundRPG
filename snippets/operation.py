import sys


def main(name):
	return f'''
export function {name} (
	args: OperationContext
): OperationResult {{

	return {{ breaks: false }};
}}'''

if __name__ == "__main__":
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = input("function name: ")
    print(main(name))
