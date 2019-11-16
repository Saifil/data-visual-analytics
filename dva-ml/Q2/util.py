from scipy import stats
import numpy as np


# This method computes entropy for information gain
def entropy(class_y):
    return stats.entropy(np.bincount(class_y), base=2)


def partition_classes(X, y, split_attribute, split_val):
    X_left = []
    X_right = []
    
    y_left = []
    y_right = []

    if isinstance(X[0][split_attribute], str):  # String type
        for i in range(len(X)):
            if X[i][split_attribute] == split_val:
                X_left.append(X[i])
                y_left.append(y[i])
            else:
                X_right.append(X[i])
                y_right.append(y[i])
    else:
        for i in range(len(X)):
            if X[i][split_attribute] <= split_val:
                X_left.append(X[i])
                y_left.append(y[i])
            else:
                X_right.append(X[i])
                y_right.append(y[i])

    return (X_left, X_right, y_left, y_right)

    
def information_gain(previous_y, current_y):
    info_gain = entropy(previous_y)
    for y in current_y:
        info_gain -= 1.0 * entropy(y) * len(y) / len(previous_y)

    return info_gain
