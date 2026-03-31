#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;
#include <random>
#include <chrono>
typedef long long ll;
mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());

ll getRandomNumber(ll l, ll r)
{
    return uniform_int_distribution<ll>(l, r)(rng);
}

bool contain(string &s, char c)
{
    bool exist = 0;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c)
        {
            exist = 1;
        }
    }
    return exist;
}

bool should_not_contain(string &s, char c)
{
    bool exist = 1;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c)
        {
            exist = 0;
        }
    }
    return exist;
}

bool contain_at_pos(string &s, char c, int pos)
{
    bool exist = 0;

    if (s[pos - 1] == c)
    {
        exist = 1;
    }

    return exist;
}

bool contain_not_at_pos(string &s, char c, int pos)
{
    bool exist = 0;
    for (int i = 0; i < s.size(); i++)
    {
        if (s[i] == c && i != (pos - 1))
        {
            exist = 1;
        }
    }
    if (s[pos - 1] == c)
    {
        exist = 0;
    }
    return exist;
}

int main()
{
    ifstream file("/home/haze/Dev/worddlesolver/output.txt");
    if (!file.is_open())
    {
        std::cerr << "Error: Could not open file!" << std::endl;
        return 1;
    }

    std::vector<std::string> lines;
    std::string line;
    vector<string> TRY = {"brick", "glent", "jumpy", "vozhd", "waqfs"};
    while (std::getline(file, line))
    {
        if (!line.empty() && line.back() == '\r')
        { // Trim CR if present
            line.pop_back();
        }
        lines.push_back(line);
    }

    vector<string> results;
    string sample = "gi3gn4ye3yg1yy5bk8";
    string code = "";
    for (int i = 0; i < TRY.size(); i++)
    {
        string input;
        cout << TRY[i] << endl;
        cin >> input;
        code += input;
    }

    for (int i = 0; i < lines.size(); i++)
    {
        bool to_add = 1;
        int j = 0;
        while (j < code.size())
        {
            if (code[j] == 'g')
            {
                bool result = contain_at_pos(lines[i], code[j + 1], (code[j + 2] - '0'));
                j += 3;
                to_add = to_add && result;
            }
            else if (code[j] == 'y')
            {
                bool result = contain_not_at_pos(lines[i], code[j + 1], (code[j + 2] - '0'));
                j += 3;
                to_add = to_add && result;
            }
            else if (code[j] == 'b')
            {
                bool result = should_not_contain(lines[i], code[j + 1]);
                j += 3;
                to_add = to_add && result;
            }
        }
        if (to_add)
        {
            results.push_back(lines[i]);
        }
    }
    if (results.size() == 1)
    {
        cout << endl
             << "Here is the exact solution :" << endl;
        for (int i = 0; i < results.size(); i++)
        {
            cout << results[i] << endl;
        }
    }
    else if (results.size() > 1)
    {
        cout << endl
             << "Here are possible solutions :" << endl;
        for (int i = 0; i < results.size(); i++)
        {
            cout << results[i] << endl;
        }
    }
    else
    {
        cout << endl
             << "No solution found" << endl;
    }
}