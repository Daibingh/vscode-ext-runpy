import sys
import json
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--workdir')
    parser.add_argument('--doc')
    parser.add_argument('--row', type=int)
    parser.add_argument('--col', type=int)

    F = parser.parse_args()

    with open(F.doc) as f:
        text = f.read()
        print(text.split('\n')[F.row])