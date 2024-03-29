from util import entropy, information_gain, partition_classes
import numpy as np
import ast


class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        self.tree = []  # Used list of dictionaries
        # self.tree = {}

    def learn(self, X, y):
        # Do for root node
        root = {"X_train": X, "y_pred": y, "left": None, "right": None, "split_attribute": None, "split_val": None}
        self.tree.append(root)

        idx_i = 0
        while idx_i < len(self.tree):
            index = idx_i
            idx_i += 1
            X = self.tree[index]['X_train']
            y = self.tree[index]['y_pred']

            if "leaf" in self.tree[index]:
                continue
            if np.unique(y).shape[0] == 1:
                self.tree[index]["leaf"] = y[0]
                continue

            cols = len(X[0])
            max_ig = -float('Inf')
            split_attribute = None
            X_l = X_r = y_l = y_r = None
            final_split_val = ''

            # Get the Split Value
            for j in range(cols):  # Do for all columns
                split_val = ''
                if isinstance(X[0][j], str):
                    count = {}
                    max_count = 0
                    for i in range(len(X)):
                        if X[i][j] not in count:
                            count[X[i][j]] = 1
                        else:
                            count[X[i][j]] += 1
                        if count[X[i][j]] > max_count:
                            max_count = count[X[i][j]]
                            split_val = X[i][j]
                else:
                    summation = 0
                    for i in range(len(X)):
                        summation += X[i][j]
                    split_val = 1.0 * summation / len(X)

                # Get the Information Gain
                X_left, X_right, y_left, y_right = partition_classes(X, y, j, split_val)
                ig = information_gain(y, [y_left, y_right])
                if ig > max_ig:
                    max_ig = ig
                    split_attribute = j
                    final_split_val = split_val
                    X_l, X_r, y_l, y_r = X_left, X_right, y_left, y_right

            # Check if column has unique elements
            num_check_unique = []
            for i in range(len(X)):
                num_check_unique.append(X[i][split_attribute])
            if np.unique(num_check_unique).shape[0] == 1:  # No unique elements in column
                unique, pos = np.unique(y, return_inverse=True)
                counts = np.bincount(pos)
                maxpos = counts.argmax()
                self.tree[index]["leaf"] = unique[maxpos]
                continue

            self.tree[index]["left"] = len(self.tree)
            self.tree[index]["right"] = len(self.tree) + 1
            self.tree[index]["split_attribute"] = split_attribute
            self.tree[index]["split_val"] = final_split_val

            # Append left
            self.tree.append(
                {"X_train": X_l, "y_pred": y_l, "left": None, "right": None, "split_attribute": None,
                 "split_val": None})
            # Append right
            self.tree.append(
                {"X_train": X_r, "y_pred": y_r, "left": None, "right": None, "split_attribute": None,
                 "split_val": None})

    def classify(self, record):
        current_index = 0
        while "leaf" not in self.tree[current_index]:
            split_attribute = self.tree[current_index]["split_attribute"]
            split_val = self.tree[current_index]["split_val"]
            if record[split_attribute] <= split_val:
                current_index = self.tree[current_index]["left"]
            else:
                current_index = self.tree[current_index]["right"]
        return self.tree[current_index]["leaf"]
