import sys


def main(name):
	return f'''
export function {name} (
  ctx: OperationContext
): OperationResult {{
  const result: OperationResult = {{ breaks: false }};

  forEachTargetEntity(ctx, (target, targetActor) => {{

    result.triggers ??= [];
    result.triggers.push({{
      trigger: '',
      actors: [targetActor],
    }});
  }});
  return result;
}}'''

if __name__ == "__main__":
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = input("function name: ")
    print(main(name))
