from scipy import stats
import numpy as np


def entropy(class_y):
    return stats.entropy(np.bincount(class_y), base=2)

print(entropy([1, 1, 1, 1, 1, 1]))


def partition_classes(X, y, split_attribute, split_val):
    X_left = []
    X_right = []

    y_left = []
    y_right = []

    return (X_left, X_right, y_left, y_right)


def information_gain(previous_y, current_y):
    info_gain = entropy(previous_y)
    for y in current_y:
        info_gain -= 1.0 * entropy(y) * len(y) / len(previous_y)

    return info_gain


X = [[3, 'aa', 10],
     [1, 'bb', 22],
     [2, 'cc', 28],
     [5, 'bb', 32],
     [4, 'cc', 32]]
y = [1, 1, 0, 0, 1]
X = np.array(X)
# print(X)
# y = np.asarray([y])


# print(np.unique([1, 2, 2, 2, 2]).shape[0])

# # print(information_gain([0, 0, 0, 1, 1, 1], [[0, 0], [1, 1, 1, 0]]))
# str_list = ['apply', 'mango', 'cherry']
# str_list = [0.0, 11.0, 0.2]

# print(type(np.asarray(X)[:, 1][0]))

# print(X[:, 1].dtype.type is np.str_)

# print(X.shape, y.T.shape)
# print(np.concatenate((X, y.T), axis=1))
# XX = np.concatenate((X, y.T), axis=1)
arr = ['b', 'a', 'b', 'a', 'b', 'b', 'a', 'aaa']
unique, pos = np.unique(arr, return_inverse=True)
counts = np.bincount(pos)
maxpos = counts.argmax()
print(unique[maxpos], counts[maxpos])